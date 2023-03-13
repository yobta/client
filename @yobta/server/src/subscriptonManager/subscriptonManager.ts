import {
  YobtaCollectionAnySnapshot,
  YobtaDataOperation,
  YobtaRemoteOperation,
  YobtaSubscribeOperation,
  YobtaUnsubscribeOperation,
} from '@yobta/protocol'
import { createPubSub } from '@yobta/stores'

interface YobtaConnectionManager {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    callback: (operation: YobtaRemoteOperation<Snapshot>) => void,
  ): {
    add(operation: YobtaSubscribeOperation): void
    remove(operation: YobtaUnsubscribeOperation): void
    clear(): void
  }
}

const subscriptions = createPubSub<{
  [key: string]: [YobtaRemoteOperation<YobtaCollectionAnySnapshot>]
}>()

export const registerConnection: YobtaConnectionManager = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  callback: (operation: YobtaRemoteOperation<Snapshot>) => void,
) => {
  let map: Record<string, number> = {}
  return {
    add({ channel }) {
      if (!map[channel]) {
        map[channel] = 1
        subscriptions.subscribe(channel, callback)
      } else {
        map[channel]++
      }
    },
    remove({ channel }) {
      if (map[channel]) {
        map[channel]--
        if (!map[channel]) {
          subscriptions.unsubscribe(channel, callback)
          delete map[channel]
        }
      }
    },
    clear() {
      for (const channel in map) {
        subscriptions.unsubscribe(channel, callback)
      }
      map = {}
    },
  }
}
export const notifySibscribers = <Snapshot extends YobtaCollectionAnySnapshot>(
  operations: YobtaDataOperation<Snapshot>[],
): void => {
  operations.forEach(operation => {
    try {
      subscriptions.publish(operation.channel, operation)
    } catch (error) {
      // TODO: handle error
    }
  })
}
