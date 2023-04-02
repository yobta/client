import {
  YobtaCollectionAnySnapshot,
  YobtaServerDataOperation,
  YobtaServerOperation,
  YobtaSubscribeOperation,
  YobtaUnsubscribeOperation,
} from '@yobta/protocol'
import { createPubSub } from '@yobta/stores'
import { coerceError } from '@yobta/utils'

import { createChannelMap } from './channelMap.js'
import { serverLogger } from '../serverLogger/serverLogger.js'

interface YobtaConnectionManager {
  (
    callback: (
      operation: YobtaServerOperation<YobtaCollectionAnySnapshot>,
    ) => void,
  ): {
    subscribe(clientId: string, operation: YobtaSubscribeOperation): void
    unsubscribe(clientId: string, operation: YobtaUnsubscribeOperation): void
    clear(): void
  }
}

const subscriptions = createPubSub<{
  [key: string]: [YobtaServerOperation<YobtaCollectionAnySnapshot>]
}>()

export const registerConnection: YobtaConnectionManager = (
  callback: (
    operation: YobtaServerOperation<YobtaCollectionAnySnapshot>,
  ) => void,
) => {
  const map = createChannelMap()
  return {
    subscribe(clientId, { channel }) {
      map.add(channel, clientId)
      subscriptions.subscribe(channel, callback)
    },
    unsubscribe(clientId, { channel }) {
      const shouldUnsubscribe = map.remove(channel, clientId)
      if (shouldUnsubscribe) {
        subscriptions.unsubscribe(channel, callback)
      }
    },
    clear() {
      for (const channel of map.keys()) {
        subscriptions.unsubscribe(channel, callback)
      }
      map.clear()
    },
  }
}

export const notifySibscribers = (
  operations: YobtaServerDataOperation<YobtaCollectionAnySnapshot>[],
): void => {
  operations.forEach(operation => {
    try {
      subscriptions.publish(operation.channel, operation)
    } catch (err) {
      const error = coerceError(err)
      serverLogger.error(error)
    }
  })
}
