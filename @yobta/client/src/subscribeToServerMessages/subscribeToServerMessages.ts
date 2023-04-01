import {
  YobtaCollectionAnySnapshot,
  YobtaUnsubscribeOperation,
  YOBTA_UNSUBSCRIBE,
} from '@yobta/protocol'

import { YobtaLogVersionGetter } from '../createLogVersionGetter/createLogVersionGetter.js'
import { createOperation } from '../createOperation/createOperation.js'
import { getSubscribeOperation } from '../getSubscribeOperation/getSubscribeOperation.js'
import { dequeueOperation, queueOperation } from '../queue/queue.js'
import {
  YobtaServerSubscription,
  YobtaServerSubscriber,
  addServerSubscription,
  removeServerSubscription,
} from '../subscriptions/subscriptions.js'

export const subscribeToServerMessages = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  channel: string,
  getVersion: YobtaLogVersionGetter,
  callback: YobtaServerSubscriber<Snapshot>,
): VoidFunction => {
  const subscription: YobtaServerSubscription<YobtaCollectionAnySnapshot> = {
    callback:
      callback as unknown as YobtaServerSubscriber<YobtaCollectionAnySnapshot>,
    channel,
    getVersion,
  }
  addServerSubscription(subscription)
  const operartion = getSubscribeOperation(channel, getVersion())
  queueOperation(operartion)
  return () => {
    removeServerSubscription(subscription)
    const unsubscribe = createOperation<YobtaUnsubscribeOperation>({
      id: `${channel}/unsubscribe`,
      channel,
      type: YOBTA_UNSUBSCRIBE,
    })
    const shouldUnsubscribe = !dequeueOperation(operartion.id)
    if (shouldUnsubscribe) {
      queueOperation(unsubscribe)
    }
  }
}
