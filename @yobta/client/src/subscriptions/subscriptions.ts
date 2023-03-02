import {
  YobtaDataOperation,
  YobtaMergeOperation,
  YobtaRejectOperation,
  YobtaRemoteOperation,
  YobtaSubscribeOperation,
  YOBTA_BATCH,
  YOBTA_ERROR,
  YOBTA_MERGE,
  YOBTA_RECEIVED,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { YobtaLogVersionGetter } from '../createLogVersionGetter/createLogVersionGetter.js'
import { createErrorYobta } from '../errorsStore/errorsStore.js'
import { getSubscribeOperation } from '../getSubscribeOperation/getSubscribeOperation.js'
import { notifyOperationObservers } from '../operationResult/operationResult.js'
import { dequeueOperation } from '../queue/queue.js'
import { computeServerTime } from '../serverTime/serverTime.js'

type YobtaNotification =
  | YobtaDataOperation
  | YobtaMergeOperation
  | YobtaRejectOperation
export type YobtaServerSubscriber = (operation: YobtaNotification) => void
export type YobtaServerSubscription = {
  callback: YobtaServerSubscriber
  channel: string
  getVersion: YobtaLogVersionGetter
}

const serverSubscriptionsStore = new Set<YobtaServerSubscription>()

export const addServerSubscription = (
  subscription: YobtaServerSubscription,
): void => {
  serverSubscriptionsStore.add(subscription)
}

export const removeServerSubscription = (
  subscription: YobtaServerSubscription,
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

export const notifySubscribers = (operation: YobtaNotification): void => {
  for (const { callback, channel } of serverSubscriptionsStore) {
    if (operation.channel === channel) callback(operation)
  }
}

export const handleRemoteOperation = (
  operation: YobtaRemoteOperation,
): void => {
  switch (operation.type) {
    case YOBTA_RECEIVED: {
      const committed = dequeueOperation(operation)
      if (committed) {
        computeServerTime(committed, operation.received)
      }
      break
    }
    case YOBTA_ERROR: {
      createErrorYobta(operation)
      break
    }
    case YOBTA_MERGE:
    case YOBTA_REJECT: {
      notifyOperationObservers(operation)
      notifySubscribers(operation)
      break
    }
    case YOBTA_BATCH: {
      for (const op of operation.operations) notifySubscribers(op)
      break
    }
    default: {
      notifySubscribers(operation)
      break
    }
  }
}
