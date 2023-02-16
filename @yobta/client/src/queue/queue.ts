import { broadcastChannelPlugin, createStore } from '@yobta/stores'
import {
  YobtaOperationId,
  YobtaClientOperation,
  YobtaReceived,
} from '@yobta/protocol'

import { compensateTimeDifference } from '../serverTime/serverTime.js'

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

export const dequeueOperationAndFixTime = (operation: YobtaReceived): void => {
  const clientOperation = operationsQueue.get(operation.ref)
  if (clientOperation) {
    compensateTimeDifference(clientOperation.committed, operation.committed)
  }
  operationsQueue.delete(operation.ref)
}
