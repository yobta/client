import { YobtaSubscribe } from '@yobta/protocol'

import { getSubscribeOperation } from '../lwwCollection/getSubscribeOperation.js'
import { operationsQueue } from '../queue/queue.js'
import { subscriptionsStore } from './subscriptions.js'

export const getAllSubscribeOperarions = (): YobtaSubscribe[] => {
  const operations = [...subscriptionsStore.entries()].reduce<YobtaSubscribe[]>(
    (acc, [channel, { committed }]) => {
      const operation = getSubscribeOperation(channel, committed)
      if (!operationsQueue.has(operation.id)) acc.push(operation)
      return acc
    },
    [],
  )
  return operations
}
