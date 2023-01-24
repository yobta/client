import { WebSocketServer } from 'ws'
import { YOBTA_SUBSCRIBE, YOBTA_UNSUBSCRIBE } from '@yobta/protocol'

import { createServerOperation } from '../serverOperation'
import { messageBroker } from '../messageBroker'
import { parseClientOperation } from '../clientOperation'
import { subscribe, unsubscribe } from '../subscriptions'

interface ServerFactory {
  (wss: WebSocketServer): void
}

export const serverYobta: ServerFactory = wss => {
  wss.on('connection', (wsConnection, req) => {
    wsConnection.on('message', (message: string) => {
      let { operation, headers } = parseClientOperation(message)
      let receivedOp = createServerOperation({
        id: performance.now().toString(),
        ref: operation.id,
        time: Date.now(),
        type: 'received',
      })
      wsConnection.send(receivedOp)
      switch (operation.type) {
        case YOBTA_SUBSCRIBE:
          subscribe(wsConnection, operation.channel)
          break
        case YOBTA_UNSUBSCRIBE:
          unsubscribe(wsConnection, operation.channel)
          break
        default:
          messageBroker.publish(operation.channel, { headers, operation })
          break
      }
    })
  })
}

// wss.on('connection', (ws, req) => {
//   console.log('connected:', wss.clients.size)
//   ws.upgradeReq = req
//   ws.subscriptions = new Set()
//   ws.on('close', event => {
//     console.log('disconnected', wss.clients.size)
//   })
//   ws.on('message', message => {
//     let data = JSON.parse(message)
//     let recevedOp = opYobta({
//       id: performance.now().toString(),
//       ref: data.operation.id,
//       time: Date.now(),
//       type: 'received',
//     })
//     ws.send(recevedOp)

//     let clientOp = {
//       ...data.operation,
//       time: Math.min(data.operation.time, Date.now()),
//     }

//     // console.log('data: ', data)
//     switch (data.operation.type) {
//       case 'subscribe': {
//         ws.subscriptions.add(data.operation.channel)
//         let missingTodos = getTodos(data.operation.version)
//         let operations = missingTodos.map(todo => ({
//           id: performance.now().toString(),
//           time: todo.time,
//           channel: 'todos',
//           type: 'collection-insert',
//           data: todo,
//         }))
//         let o = opYobta({
//           id: Date.now().toString(),
//           channel: 'todos',
//           type: 'batch',
//           operations,
//         })
//         ws.send(o)
//         break
//       }
//       case 'collection-insert': {
//         todos.set(clientOp.data.id, { ...clientOp.data, time: clientOp.time })
//         // console.log('clientOp: ', clientOp)
//         let commitOperation = opYobta({
//           id: performance.now().toString(),
//           channel: clientOp.channel,
//           ref: clientOp.id,
//           time: clientOp.time,
//           type: 'commit',
//         })
//         ws.send(commitOperation)
//         wss.clients.forEach(client => {
//           if (client.subscriptions.has('todos')) {
//             let clientOpString = opYobta(clientOp)
//             client.send(clientOpString)
//           }
//         })
//         break
//       }
//       case 'unsubscribe': {
//         ws.subscriptions.delete(data.operation.channel)
//         break
//       }

//       default:
//         break
//     }

//     // console.log(data)
//   })
// })
