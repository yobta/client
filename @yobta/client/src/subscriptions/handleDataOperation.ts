import { YobtaDataOperation } from '@yobta/protocol'

import { queueOperation } from '../queue/queue.js'
import { notifySubscribers } from './notifySubscribers.js'
import { subscriptionsStore } from './subscriptions.js'

interface HandleDataOperation {
  (operation: YobtaDataOperation): void
}

export const handleDataOperation: HandleDataOperation = operation => {
  let subscription = subscriptionsStore.get(operation.channel)
  if (subscription) {
    subscription.pending.add(operation)
    notifySubscribers(subscription)
  }
  queueOperation(operation)
}
