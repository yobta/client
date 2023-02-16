import {
  YobtaClientOperation,
  YobtaDataOperation,
  YobtaError,
  YobtaRemoteOperation,
  YobtaSubscribe,
  YobtaUnsubscribe,
} from '@yobta/protocol'
import { createPubSub } from '@yobta/stores'

import { ServerCallbacks } from '../createServer/createServer.js'

interface ConnectionManager {
  (callback: (operation: YobtaRemoteOperation) => void): {
    add(operation: YobtaSubscribe): void
    remove(operation: YobtaUnsubscribe): void
    clear(): void
  }
}
interface SendBack {
  (operations: [YobtaDataOperation, ...YobtaDataOperation[]]): void
}
interface ThrowBack {
  (error: YobtaError): void
}

const incoming = createPubSub<{
  [key: string]: [
    { headers: Headers; operation: YobtaClientOperation },
    ServerCallbacks,
  ]
}>()

const errorChannel = Symbol('errorChannel')
const outgoing = createPubSub<{
  [key: string]: [YobtaRemoteOperation]
  [key: symbol]: [YobtaError]
}>()

export const onClientMessage = incoming.subscribe
export const broadcastClientMessage = incoming.publish

export const registerConnection: ConnectionManager = (
  callback: (operation: YobtaRemoteOperation) => void,
) => {
  let map: Record<string, number> = {}
  const unsubsribe = outgoing.subscribe(errorChannel, callback)
  return {
    add({ channel }) {
      if (!map[channel]) {
        map[channel] = 1
        outgoing.subscribe(channel, callback)
      } else {
        map[channel]++
      }
    },
    remove({ channel }) {
      if (map[channel]) {
        map[channel]--
        if (!map[channel]) {
          outgoing.unsubscribe(channel, callback)
          delete map[channel]
        }
      }
    },
    clear() {
      for (const channel in map) {
        outgoing.unsubscribe(channel, callback)
      }
      map = {}
      unsubsribe()
    },
  }
}
export const sendBack: SendBack = operations => {
  operations.forEach(operation => {
    outgoing.publish(operation.channel, operation)
  })
}

export const throwBack: ThrowBack = error => {
  outgoing.publish(errorChannel, error)
}
