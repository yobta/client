import { WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import {
  YobtaRejectOperation,
  YobtaSubscribeOperation,
  YobtaUnsubscribeOperation,
  YOBTA_RECEIVED,
} from '@yobta/protocol'

import { stringifyServerOperation } from '../stringifyServerOperation/stringifyServerOperation.js'
import {
  broadcastClientMessage,
  registerConnection,
} from '../messageBroker/index.js'
import { parseClientOperation } from '../clientOperation/index.js'

interface ServerFactory {
  (wss: WebSocketServer): void
}

export type ServerCallbacks = {
  reject(operation: YobtaRejectOperation): void
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
      reject(operation) {
        const message: string = stringifyServerOperation(operation)
        connection.send(message)
      },
      subscribe: mediator.add,
      unsubscribe: mediator.remove,
    }
    connection.on('message', (message: string) => {
      const { operation, headers } = parseClientOperation(message)
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
    })
    connection.on('close', mediator.clear)
  })
}
