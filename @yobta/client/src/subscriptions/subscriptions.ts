import {
  YobtaCollectionAnySnapshot,
  YobtaServerOperation,
  YobtaSubscribeOperation,
  YOBTA_REJECT,
  YOBTA_RECEIVED,
  YobtaRejectOperation,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionDeleteOperation,
  YobtaCollectionRestoreOperation,
  YobtaCollectionMoveOperation,
} from '@yobta/protocol'

import { YobtaLogVersionGetter } from '../createLogVersionGetter/createLogVersionGetter.js'
import { createErrorYobta } from '../errorsStore/errorsStore.js'
import { getSubscribeOperation } from '../getSubscribeOperation/getSubscribeOperation.js'
import { notifyOperationObservers } from '../operationResult/operationResult.js'
import { dequeueOperation } from '../queue/queue.js'
import { computeServerTime } from '../serverTime/serverTime.js'

export type YobtaServerSubscriber<Snapshot extends YobtaCollectionAnySnapshot> =
  (operation: Operation<Snapshot>) => void
export type YobtaServerSubscription<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  callback: YobtaServerSubscriber<Snapshot>
  channel: string
  getVersion: YobtaLogVersionGetter
}
type Operation<Snapshot extends YobtaCollectionAnySnapshot> =
  | YobtaRejectOperation
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionRevalidateOperation<Snapshot>
  | YobtaCollectionDeleteOperation
  | YobtaCollectionRestoreOperation
  | YobtaCollectionMoveOperation

const serverSubscriptionsStore = new Set<
  YobtaServerSubscription<YobtaCollectionAnySnapshot>
>()

export const addServerSubscription = (
  subscription: YobtaServerSubscription<YobtaCollectionAnySnapshot>,
): void => {
  serverSubscriptionsStore.add(subscription)
}

export const removeServerSubscription = (
  subscription: YobtaServerSubscription<YobtaCollectionAnySnapshot>,
): void => {
  serverSubscriptionsStore.delete(subscription)
}

export const getAllSubscribeOperarions = (): YobtaSubscribeOperation[] => {
  const operations: YobtaSubscribeOperation[] = []
  for (const { channel, getVersion } of serverSubscriptionsStore) {
    const operation = getSubscribeOperation(channel, getVersion())
    operations.push(operation)
  }
  return operations
}

export const notifySubscribers = (
  operation: Operation<YobtaCollectionAnySnapshot>,
): void => {
  for (const { callback, channel } of serverSubscriptionsStore) {
    if (operation.channel === channel) {
      callback(operation)
    }
  }
}

export const handleRemoteOperation = (
  operation: YobtaServerOperation<YobtaCollectionAnySnapshot>,
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
