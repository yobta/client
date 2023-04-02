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
      const clientAdded = map.add(channel, clientId)
      subscriptions.subscribe(channel, callback)
      if (clientAdded) {
        serverLogger.debug(`Client ${clientId} subscribed to ${channel}`)
      }
    },
    unsubscribe(clientId, { channel }) {
      const shouldUnsubscribe = map.remove(channel, clientId)
      serverLogger.debug(`Client ${clientId} unsubscribed from ${channel}`)
      if (shouldUnsubscribe) {
        subscriptions.unsubscribe(channel, callback)
        serverLogger.debug(`Channel ${channel} is empty, unsubscribing`)
      }
    },
    clear() {
      for (const channel of map.keys()) {
        subscriptions.unsubscribe(channel, callback)
      }
      map.clear()
      serverLogger.debug('Connection manager cleared')
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
