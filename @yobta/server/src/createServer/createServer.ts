import { WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import {
  YobtaMergeOperation,
  YobtaRejectOperation,
  YobtaSubscribeOperation,
  YobtaUnsubscribeOperation,
  YOBTA_RECEIVED,
} from '@yobta/protocol'

import { createServerOperation } from '../serverOperation/index.js'
import {
  broadcastClientMessage,
  registerConnection,
} from '../messageBroker/index.js'
import { parseClientOperation } from '../clientOperation/index.js'

interface ServerFactory {
  (wss: WebSocketServer): void
}

export type ServerCallbacks = {
  commit(operation: YobtaMergeOperation): void
  reject(operation: YobtaRejectOperation): void
  subscribe(operation: YobtaSubscribeOperation): void
  unsubscribe(operation: YobtaUnsubscribeOperation): void
}

export const createServer: ServerFactory = wss => {
  wss.on('connection', connection => {
    const mediator = registerConnection(operation => {
      const message = createServerOperation(operation)
      connection.send(message)
    })
    const callbacks: ServerCallbacks = {
      commit(operation) {
        const message: string = createServerOperation(operation)
        connection.send(message)
      },
      reject(operation) {
        const message: string = createServerOperation(operation)
        connection.send(message)
      },
      subscribe: mediator.add,
      unsubscribe: mediator.remove,
    }
    connection.on('message', (message: string) => {
      const { operation, headers } = parseClientOperation(message)
      const receivedOp = createServerOperation({
        id: nanoid(),
        ref: operation.id,
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
