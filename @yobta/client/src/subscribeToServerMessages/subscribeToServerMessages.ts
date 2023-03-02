import { YobtaUnsubscribeOperation, YOBTA_UNSUBSCRIBE } from '@yobta/protocol'

import { YobtaLogVersionGetter } from '../createLogVersionGetter/createLogVersionGetter.js'
import { createOperation } from '../createOperation/createOperation.js'
import { getSubscribeOperation } from '../getSubscribeOperation/getSubscribeOperation.js'
import { operationsQueue, queueOperation } from '../queue/queue.js'
import {
  YobtaServerSubscription,
  YobtaServerSubscriber,
  addServerSubscription,
  removeServerSubscription,
} from '../subscriptions/subscriptions.js'

export const subscribeToServerMessages = (
  channel: string,
  getVersion: YobtaLogVersionGetter,
  callback: YobtaServerSubscriber,
): VoidFunction => {
  const subscription: YobtaServerSubscription = {
    callback,
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
    if (operationsQueue.has(operartion.id)) {
      operationsQueue.delete(operartion.id)
    } else {
      queueOperation(unsubscribe)
    }
  }
}