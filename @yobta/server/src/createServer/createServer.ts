import { WebSocketServer } from 'ws'
import { nanoid } from 'nanoid'
import {
  YobtaCommit,
  YobtaReject,
  YobtaSubscribe,
  YobtaUnsubscribe,
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
  subscribe(operation: YobtaSubscribe): void
  unsubscribe(operation: YobtaUnsubscribe): void
}

export const createServer: ServerFactory = wss => {
  wss.on('connection', (connection, req) => {
<<<<<<< HEAD:@yobta/server/src/server/index.ts
    const callbacks: ServerCallbacks = {
=======
    let mediator = registerConnection(operation => {
      let message = createServerOperation(operation)
      connection.send(message)
    })
    let callbacks: ServerCallbacks = {
>>>>>>> 179d7c0 (wip server collection):@yobta/server/src/createServer/createServer.ts
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
<<<<<<< HEAD:@yobta/server/src/server/index.ts
    const mediator = registerConnection(operation => {
      const message = createServerOperation(operation)
      connection.send(message)
    })
=======
>>>>>>> 179d7c0 (wip server collection):@yobta/server/src/createServer/createServer.ts
    connection.on('message', (message: string) => {
      const { operation, headers } = parseClientOperation(message)
      const receivedOp = createServerOperation({
        id: nanoid(),
        ref: operation.id,
        time: Date.now(),
        type: 'received',
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
