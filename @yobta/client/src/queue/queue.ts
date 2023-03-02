import { broadcastChannelPlugin, createStore } from '@yobta/stores'
import {
  YobtaOperationId,
  YobtaClientOperation,
  YobtaReceived,
} from '@yobta/protocol'

type State = Map<YobtaOperationId, YobtaClientOperation>

export const operationsQueue: State = new Map()

const channel = createStore<YobtaClientOperation>(
  {} as YobtaClientOperation,
  broadcastChannelPlugin({
    channel: 'yobta-client-op',
  }),
)

export const observeQueue = channel.observe

export const queueOperation = (operation: YobtaClientOperation): void => {
  operationsQueue.set(operation.id, operation)
  channel.next(operation)
}

export const dequeueOperation = (
  operation: YobtaReceived,
): number | undefined => {
  const time = operationsQueue.get(operation.id)?.committed
  operationsQueue.delete(operation.id)
  return time
}
