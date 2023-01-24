import { YobtaDataOperation } from '@yobta/protocol'

import { logYobta } from '../log/log.js'
import { Subscription, subscriptionsStore } from './subscriptions.js'

interface GetSubscription {
  (channel: string, committedOperations: YobtaDataOperation[]): Subscription
}

export const getSubscription: GetSubscription = (
  channel,
  committedOperations,
) => {
  let subscription = subscriptionsStore.get(channel)
  if (!subscription) {
    subscription = {
      subscribers: new Set(),
      committed: logYobta(committedOperations),
      pending: logYobta([]),
    }
    subscriptionsStore.set(channel, subscription)
  }
  return subscription
}
