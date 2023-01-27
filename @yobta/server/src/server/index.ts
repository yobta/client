import { WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import {
  YobtaCommit,
  YobtaReject,
  YOBTA_SUBSCRIBE,
  YOBTA_UNSUBSCRIBE,
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
  commit(operation: YobtaCommit): void
  reject(operation: YobtaReject): void
}

export const serverYobta: ServerFactory = wss => {
  wss.on('connection', (connection, req) => {
    let callbacks: ServerCallbacks = {
      commit(operation) {
        let message: string = createServerOperation(operation)
        connection.send(message)
      },
      reject(operation) {
        let message: string = createServerOperation(operation)
        connection.send(message)
      },
    }
    let mediator = registerConnection(operation => {
      let message = createServerOperation(operation)
      connection.send(message)
    })
    connection.on('message', (message: string) => {
      let { operation, headers } = parseClientOperation(message)
      let receivedOp = createServerOperation({
        id: nanoid(),
        ref: operation.id,
        time: Date.now(),
        type: 'received',
      })
      connection.send(receivedOp)
      switch (operation.type) {
        case YOBTA_SUBSCRIBE:
          mediator.add(operation.channel)
          break
        case YOBTA_UNSUBSCRIBE:
          mediator.remove(operation.channel)
          break
        default:
          broadcastClientMessage(
            operation.channel,
            { headers, operation },
            callbacks,
          )
          break
      }
    })
    connection.on('close', mediator.clear)
  })
}
