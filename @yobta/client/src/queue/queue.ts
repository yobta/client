import { broadcastChannelPlugin, createStore } from '@yobta/stores'
import {
  YobtaOperationId,
  YobtaClientOperation,
  YobtaCollectionAnySnapshot,
} from '@yobta/protocol'

const queue = new Map<
  YobtaOperationId,
  YobtaClientOperation<YobtaCollectionAnySnapshot>
>()

const crosstabChannel = createStore<
  YobtaClientOperation<YobtaCollectionAnySnapshot>
>(
  {} as YobtaClientOperation<YobtaCollectionAnySnapshot>,
  broadcastChannelPlugin({
    channel: 'yobta-client-op',
  }),
)

export const observeQueue = crosstabChannel.observe

export const queueOperation = <Snapshot extends YobtaCollectionAnySnapshot>(
  operation: YobtaClientOperation<Snapshot>,
): void => {
  queue.set(operation.id, operation)
  crosstabChannel.next(operation)
}

export const dequeueOperation = (operationId: YobtaOperationId): boolean =>
  queue.delete(operationId)

export const getQueuedClientOperations =
  (): YobtaClientOperation<YobtaCollectionAnySnapshot>[] => [...queue.values()]
