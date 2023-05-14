import {
  YobtaCollectionAnySnapshot,
  YobtaServerOperation,
  YobtaSubscribeOperation,
  YOBTA_REJECT,
  YOBTA_RECEIVED,
  YobtaRejectOperation,
  YobtaCollectionCreateOperation,
  YobtaCollectionUpdateOperation,
  YobtaCollectionRevalidateOperation,
  YobtaChannelDeleteOperation,
  YobtaChannelRestoreOperation,
  YobtaChannelShiftOperation,
  YobtaUnsubscribeOperation,
  YOBTA_UNSUBSCRIBE,
  YobtaBatchOperation,
  YobtaChannelInsertOperation,
} from '@yobta/protocol'

import { YobtaLogVersionGetter } from '../createClientLog/createLogVersionGetter.js'
import { createErrorYobta } from '../errorsStore/errorsStore.js'
import { getSubscribeOperation } from '../getSubscribeOperation/getSubscribeOperation.js'
import { notifyOperationObservers } from '../operationResult/operationResult.js'
import { dequeueOperation, queueOperation } from '../queue/queue.js'
import { trackServerTime } from '../serverTime/serverTime.js'
import { createOperation } from '../createOperation/createOperation.js'

// #region types
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
  | YobtaCollectionCreateOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionRevalidateOperation<Snapshot>
  | YobtaChannelInsertOperation
  | YobtaChannelDeleteOperation
  | YobtaChannelRestoreOperation
  | YobtaChannelShiftOperation
  | YobtaBatchOperation<Snapshot>
// #endregion

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
      trackServerTime(operation.id, operation.received)
      dequeueOperation(operation.id)
      break
    }
    default: {
      if (operation.type === YOBTA_REJECT) {
        createErrorYobta(operation)
      }
      notifySubscribers(operation)
      break
    }
  }
  notifyOperationObservers(operation)
}

export const subscribeToServerMessages = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  channel: string,
  getVersion: YobtaLogVersionGetter,
  callback: YobtaServerSubscriber<Snapshot>,
): VoidFunction => {
  const subscription: YobtaServerSubscription<Snapshot> = {
    callback,
    channel,
    getVersion,
  }
  addServerSubscription(
    subscription as unknown as YobtaServerSubscription<YobtaCollectionAnySnapshot>,
  )
  const operartion = getSubscribeOperation(channel, getVersion())
  queueOperation(operartion)
  return () => {
    removeServerSubscription(
      subscription as unknown as YobtaServerSubscription<YobtaCollectionAnySnapshot>,
    )
    dequeueOperation(operartion.id)
    queueOperation(
      createOperation<YobtaUnsubscribeOperation>({
        id: `${channel}/unsubscribe`,
        channel,
        type: YOBTA_UNSUBSCRIBE,
      }),
    )
  }
}
