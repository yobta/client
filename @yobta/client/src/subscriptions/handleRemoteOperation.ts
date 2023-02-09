import {
  YobtaRemoteOperation,
  YOBTA_BATCH,
  YOBTA_COMMIT,
  YOBTA_ERROR,
  YOBTA_RECEIVED,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { notifyOperationObservers } from '../operationResult/operationResult.js'
import { createErrorYobta } from '../errorsStore/errorsStore.js'
import { dequeueOperationAndFixTime } from '../queue/queue.js'
import { subscriptionsStore } from './subscriptions.js'
import { notifySubscribers } from './notifySubscribers.js'

export const handleRemoteOperation = (message: YobtaRemoteOperation): void => {
  if (message.type === YOBTA_RECEIVED) {
    dequeueOperationAndFixTime(message)
    return
  }
  if (message.type === YOBTA_ERROR) {
    createErrorYobta(message)
    return
  }
  const subscription = subscriptionsStore.get(message.channel)
  if (!subscription) return
  const { committed, pending } = subscription
  switch (message.type) {
    case YOBTA_COMMIT: {
      const op = pending.remove(message.ref)
      if (op) committed.add({ ...op, time: message.time })
      notifyOperationObservers(message)
      break
    }
    case YOBTA_REJECT:
      pending.remove(message.id)
      notifyOperationObservers(message)
      break
    case YOBTA_BATCH: {
      committed.add(...message.operations)
      break
    }
    default: {
      committed.add(message)
      break
    }
  }
  notifySubscribers(subscription)
}
