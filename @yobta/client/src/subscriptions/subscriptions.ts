import {
  YobtaCollectionAnySnapshot,
  YobtaRemoteOperation,
  YobtaSubscribeOperation,
  YOBTA_REJECT,
  YOBTA_RECEIVED,
} from '@yobta/protocol'

import { YobtaLogInput } from '../createLog/createLog.js'
import { YobtaLogVersionGetter } from '../createLogVersionGetter/createLogVersionGetter.js'
import { createErrorYobta } from '../errorsStore/errorsStore.js'
import { getSubscribeOperation } from '../getSubscribeOperation/getSubscribeOperation.js'
import { notifyOperationObservers } from '../operationResult/operationResult.js'
import { dequeueOperation } from '../queue/queue.js'
import { computeServerTime } from '../serverTime/serverTime.js'

export type YobtaServerSubscriber<Snapshot extends YobtaCollectionAnySnapshot> =
  (operation: YobtaLogInput<Snapshot>) => void
export type YobtaServerSubscription<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  callback: YobtaServerSubscriber<Snapshot>
  channel: string
  getVersion: YobtaLogVersionGetter
}

const serverSubscriptionsStore = new Set<
  YobtaServerSubscription<YobtaCollectionAnySnapshot>
>()

export const addServerSubscription = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  subscription: YobtaServerSubscription<Snapshot>,
): void => {
  serverSubscriptionsStore.add(
    subscription as YobtaServerSubscription<YobtaCollectionAnySnapshot>,
  )
}

export const removeServerSubscription = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  subscription: YobtaServerSubscription<Snapshot>,
): void => {
  serverSubscriptionsStore.delete(
    subscription as YobtaServerSubscription<YobtaCollectionAnySnapshot>,
  )
}

export const getAllSubscribeOperarions = (): YobtaSubscribeOperation[] => {
  const operations: YobtaSubscribeOperation[] = []
  for (const { channel, getVersion } of serverSubscriptionsStore) {
    const operation = getSubscribeOperation(channel, getVersion())
    operations.push(operation)
  }
  return operations
}

export const notifySubscribers = <Snapshot extends YobtaCollectionAnySnapshot>(
  operation: YobtaLogInput<Snapshot>,
): void => {
  for (const { callback, channel } of serverSubscriptionsStore) {
    if (operation.channel === channel) callback(operation)
  }
}

export const handleRemoteOperation = (
  operation: YobtaRemoteOperation<YobtaCollectionAnySnapshot>,
): void => {
  switch (operation.type) {
    case YOBTA_RECEIVED: {
      const committed = dequeueOperation(operation)
      if (committed) {
        computeServerTime(committed, operation.received)
      }
      break
    }
    default: {
      if (operation.type === YOBTA_REJECT) {
        createErrorYobta(operation)
      }
      notifyOperationObservers(operation)
      notifySubscribers(operation)
      break
    }
  }
}
