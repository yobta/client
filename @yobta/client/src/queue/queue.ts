import { broadcastChannelPlugin, createStore } from '@yobta/stores'
import {
  YobtaOperationId,
  YobtaClientOperation,
  YobtaReceived,
  YobtaCollectionAnySnapshot,
} from '@yobta/protocol'

type State = Map<
  YobtaOperationId,
  YobtaClientOperation<YobtaCollectionAnySnapshot>
>

export const operationsQueue: State = new Map()

const channel = createStore<YobtaClientOperation<YobtaCollectionAnySnapshot>>(
  {} as YobtaClientOperation<YobtaCollectionAnySnapshot>,
  broadcastChannelPlugin({
    channel: 'yobta-client-op',
  }),
)

export const observeQueue = channel.observe

export const queueOperation = <Snapshot extends YobtaCollectionAnySnapshot>(
  operation: YobtaClientOperation<Snapshot>,
): void => {
  operationsQueue.set(operation.id, operation)
  channel.next(operation)
}

export const dequeueOperation = (
  operation: YobtaReceived,
): number | undefined => {
  const time = operationsQueue.get(operation.id)?.committed
  operationsQueue.delete(operation.operationId)
  return time
}
