import {
  YobtaClientMessage,
  YobtaCollectionAnySnapshot,
  YobtaDataOperation,
  YobtaRemoteOperation,
  YobtaSubscribeOperation,
  YobtaUnsubscribeOperation,
} from '@yobta/protocol'
import { createPubSub } from '@yobta/stores'

import { ServerCallbacks } from '../createServer/createServer.js'

interface ConnectionManager {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    callback: (operation: YobtaRemoteOperation<Snapshot>) => void,
  ): {
    add(operation: YobtaSubscribeOperation): void
    remove(operation: YobtaUnsubscribeOperation): void
    clear(): void
  }
}
interface SendBack {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operations: YobtaDataOperation<Snapshot>[],
  ): void
}

const incoming = createPubSub<{
  [key: string]: [YobtaClientMessage, ServerCallbacks]
}>()

const outgoing = createPubSub<{
  [key: string]: [YobtaRemoteOperation<YobtaCollectionAnySnapshot>]
}>()

export const onClientMessage = incoming.subscribe
export const broadcastClientMessage = incoming.publish

export const registerConnection: ConnectionManager = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  callback: (operation: YobtaRemoteOperation<Snapshot>) => void,
) => {
  let map: Record<string, number> = {}
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
    },
  }
}
export const sendBack: SendBack = operations => {
  operations.forEach(operation => {
    outgoing.publish(operation.channel, operation)
  })
}
