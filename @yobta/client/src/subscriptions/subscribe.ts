import { YobtaUnsubscribe, YOBTA_UNSUBSCRIBE } from '@yobta/protocol'

import { createOperation } from '../createOperation/createOperation.js'
import { getSubscribeOperation } from '../lwwCollection/getSubscribeOperation.js'
import { operationsQueue, queueOperation } from '../queue/queue.js'
import { getSubscription } from './getSubscription.js'
import { Subscriber, subscriptionsStore } from './subscriptions.js'

export const subscribe = (
  channel: string,
  callback: Subscriber,
): VoidFunction => {
  const subscription = getSubscription(channel, [])
  subscription.subscribers.add(callback)
  const operartion = getSubscribeOperation(channel, subscription.committed)
  queueOperation(operartion)
  return () => {
    subscription.subscribers.delete(callback)
    if (subscription.subscribers.size === 0) {
      subscriptionsStore.delete(channel)
      const unsubscribe = createOperation<YobtaUnsubscribe>({
        id: `${channel}/unsubscribe`,
        channel,
        type: YOBTA_UNSUBSCRIBE,
      })
      if (operationsQueue.has(operartion.id)) {
        operationsQueue.delete(operartion.id)
      } else {
        queueOperation(unsubscribe)
      }
    }
  }
}
