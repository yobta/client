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

import { stringifyServerOperation } from '../stringifyServerOperation/stringifyServerOperation.js'
import { registerConnection } from '../subscriptonManager/subscriptonManager.js'
import { parseClientMessage } from '../parseClientMessage/parseClientMessage.js'
import { broadcastClientMessage } from '../router/router.js'
import { parseUnknownError } from '../parseUnknownError/parseUnknownError.js'

interface ServerFactory {
  (wss: WebSocketServer): void
}

export type ServerCallbacks = {
  reject(
    operation: YobtaClientOperation<YobtaCollectionAnySnapshot>,
    reason: YobtaRejectOperation['reason'],
  ): void
  subscribe(operation: YobtaSubscribeOperation): void
  unsubscribe(operation: YobtaUnsubscribeOperation): void
}

export const createServer: ServerFactory = wss => {
  wss.on('connection', connection => {
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
      subscribe: mediator.add,
      unsubscribe: mediator.remove,
    }
    connection.on('message', (message: string) => {
      try {
        const { operation, headers } = parseClientMessage(message)
        const receivedOp = stringifyServerOperation({
          id: nanoid(),
          operationId: operation.id,
          received: Date.now(),
          type: YOBTA_RECEIVED,
        })
        connection.send(receivedOp)
        broadcastClientMessage(
          operation.channel,
          { headers, operation },
          callbacks,
        )
      } catch (error) {
        connection.close(500, parseUnknownError(error).message)
        // TODO: log error
      }
    })
    connection.on('close', mediator.clear)
  })
}
