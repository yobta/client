import { WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import {
  YobtaClientOperation,
  YobtaCollectionAnySnapshot,
  YobtaRejectOperation,
  YobtaSubscribeOperation,
  YobtaUnsubscribeOperation,
  YOBTA_RECEIVED,
  YOBTA_REJECT,
} from '@yobta/protocol'
import { coerceError } from '@yobta/utils'

import { stringifyServerOperation } from '../stringifyServerOperation/stringifyServerOperation.js'
import { registerConnection } from '../subscriptonManager/subscriptonManager.js'
import { parseClientMessage } from '../parseClientMessage/parseClientMessage.js'
import { broadcastClientMessage } from '../router/router.js'
import { serverLogger } from '../serverLogger/serverLogger.js'
import { YobtaServerLogSearchResult } from '../createMemoryLog/createMemoryLog.js'

interface ServerFactory {
  (wss: WebSocketServer): void
}

export type ServerCallbacks = {
  reject(
    operation: YobtaClientOperation<YobtaCollectionAnySnapshot>,
    reason: YobtaRejectOperation['reason'],
  ): void
  sendBack(operations: YobtaServerLogSearchResult[]): void
  subscribe(clientId: string, operation: YobtaSubscribeOperation): void
  unsubscribe(clientId: string, operation: YobtaUnsubscribeOperation): void
}

export const createServer: ServerFactory = wss => {
  wss.on('connection', connection => {
    serverLogger.debug('wss: client connected')
    const mediator = registerConnection(operation => {
      const message = stringifyServerOperation(operation)
      connection.send(message)
    })
    const callbacks: ServerCallbacks = {
      reject(operation, reason) {
        const rejectOperation: YobtaRejectOperation = {
          id: nanoid(),
          channel: operation.channel,
          operationId: operation.id,
          reason,
          type: YOBTA_REJECT,
          committed: operation.committed,
          merged: Date.now(),
        }
        const message: string = stringifyServerOperation(rejectOperation)
        connection.send(message)
      },
      sendBack(operations) {
        operations.map(stringifyServerOperation).forEach(message => {
          connection.send(message)
        })
      },
      subscribe: mediator.subscribe,
      unsubscribe: mediator.unsubscribe,
    }
    connection.on('message', (message: string) => {
      try {
        const { clientId, headers, operation } = parseClientMessage(message)
        serverLogger.debug({ clientId, headers, operation })
        const receivedOp = stringifyServerOperation({
          id: nanoid(),
          operationId: operation.id,
          received: Date.now(),
          type: YOBTA_RECEIVED,
        })
        connection.send(receivedOp)
        broadcastClientMessage(
          operation.channel,
          { clientId, headers, operation },
          callbacks,
        )
      } catch (unknownError) {
        const error = coerceError(unknownError)
        connection.close(500, error.message)
        serverLogger.error(error)
      }
    })
    connection.on('close', () => {
      mediator.clear()
      serverLogger.debug('wss: client disconnected')
    })
  })
}
