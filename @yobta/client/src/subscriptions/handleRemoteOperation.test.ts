import { vi } from 'vitest'
import {
  YobtaCommit,
  YobtaError,
  YobtaCollectionInsertOperation,
  YobtaRemoteOperation,
  YobtaReject,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COMMIT,
  YOBTA_ERROR,
  YOBTA_RECEIVED,
  YOBTA_REJECT,
  YOBTA_BATCH,
  YobtaBatchOperation,
} from '@yobta/protocol'

import { createErrorYobta } from '../errorsStore/errorsStore.js'
import { dequeueOperationAndFixTime } from '../queue/queue.js'
import { getSubscription } from './getSubscription.js'
import { handleRemoteOperation } from './handleRemoteOperation.js'
import { subscriptionsStore } from './subscriptions.js'

vi.mock('../queue/queue.js', () => ({
  dequeueOperationAndFixTime: vi.fn(),
}))

vi.mock('../errorsStore/errorsStore.js', () => ({
  createErrorYobta: vi.fn(),
}))

beforeEach(() => {
  subscriptionsStore.clear()
})

it('should dequeue a received message', () => {
  const operation: YobtaRemoteOperation = {
    type: YOBTA_RECEIVED,
    id: 'message-123',
    ref: 'operation-123',
    committed: 1234,
  }
  handleRemoteOperation(operation)
  expect(dequeueOperationAndFixTime).toHaveBeenCalledWith(operation)
})

it('should add error', () => {
  const operation: YobtaError = {
    type: YOBTA_ERROR,
    id: 'message-123',
    message: 'error-message',
    committed: 1234,
  }
  handleRemoteOperation(operation)

  expect(createErrorYobta).toBeCalledWith(operation)
  expect(subscriptionsStore.size).toEqual(0)
})

it('should add a remote operation to the committed list for a valid channel', () => {
  const subscription = getSubscription('channel-123', [])
  const operation: YobtaBatchOperation = {
    type: YOBTA_BATCH,
    id: 'message-123',
    channel: 'channel-123',
    operations: [
      {
        type: YOBTA_COLLECTION_INSERT,
        id: 'operation-123',
        channel: 'channel-123',
        data: { id: 'data-123' },
        committed: 1234,
        merged: 2345,
        ref: 'data-123',
      },
    ],
  }
  handleRemoteOperation(operation)
  expect(subscription.committed.last()).toEqual(operation.operations[0])
})

it('should remove a pending operation and add it to the committed list for a commit message', () => {
  const subscription = getSubscription('channel-123', [])
  const operation: YobtaCollectionInsertOperation<any> = {
    type: YOBTA_COLLECTION_INSERT,
    id: 'operation-123',
    channel: 'channel-123',
    committed: 1234,
    merged: 1234,
    ref: 'data-123',
    data: { id: 'data-123' },
  }
  subscription.pending.add(operation)

  const commitOperation: YobtaCommit = {
    type: YOBTA_COMMIT,
    id: 'operation-123',
    channel: 'channel-123',
    ref: 'operation-123',
    committed: 1234,
  }
  handleRemoteOperation(commitOperation)

  expect(subscription.pending.last()).toBeUndefined()
  expect(subscription.committed.last()).toEqual({
    ...operation,
    committed: 1234,
  })
})

it('should remove a pending operation for a revert message', () => {
  const subscription = getSubscription('channel-123', [])
  const operation: YobtaCollectionInsertOperation<any> = {
    type: YOBTA_COLLECTION_INSERT,
    id: 'operation-123',
    channel: 'channel-123',
    committed: 123,
    merged: 1234,
    ref: 'data-123',
    data: { id: 'data-123' },
  }
  subscription.pending.add(operation)

  const rejectOperation: YobtaReject = {
    type: YOBTA_REJECT,
    id: 'operation-123',
    channel: 'channel-123',
    ref: 'operation-123',
    reason: 'revert',
    committed: 1234,
  }
  handleRemoteOperation(rejectOperation)

  expect(subscription.pending.last()).toBeUndefined()
})

it('should not notify subscribers after received operation', () => {
  const subscription = getSubscription('channel-123', [])
  const subscriber = vi.fn()
  subscription.subscribers.add(subscriber)
  const operation: YobtaRemoteOperation = {
    type: YOBTA_RECEIVED,
    id: 'message-123',
    ref: 'operation-123',
    committed: 1234,
  }
  handleRemoteOperation(operation)
  expect(subscriber).not.toBeCalled()
})

it('should not notify subscribers after error operation', () => {
  const subscription = getSubscription('channel-123', [])
  const subscriber = vi.fn()
  subscription.subscribers.add(subscriber)
  const operation: YobtaError = {
    type: YOBTA_ERROR,
    id: 'message-123',
    message: 'error-message',
    committed: 1234,
  }
  handleRemoteOperation(operation)
  expect(subscriber).not.toBeCalled()
})

it('it should notify subscribers for the rest operations', () => {
  const subscription = getSubscription('channel-123', [])
  const subscriber = vi.fn()
  subscription.subscribers.add(subscriber)
  const operation: YobtaBatchOperation = {
    channel: 'channel-123',
    type: YOBTA_BATCH,
    id: 'message-123',
    operations: [
      {
        type: YOBTA_COLLECTION_INSERT,
        id: 'operation-123',
        channel: 'channel-123',
        committed: 1234,
        merged: 2345,
        data: { id: 'data-123' },
        ref: 'data-123',
      },
    ],
  }
  handleRemoteOperation(operation)
  expect(subscriber).toBeCalledWith({
    committed: subscription.committed,
    pending: subscription.pending,
  })
})

it('should not apply operations when the channel is not subscribed', () => {
  const operation: YobtaBatchOperation = {
    channel: 'channel-123',
    type: YOBTA_BATCH,
    id: 'message-123',
    operations: [
      {
        type: YOBTA_COLLECTION_INSERT,
        id: 'operation-123',
        channel: 'channel-123',
        committed: 1234,
        data: { id: 'data-123' },
        merged: 2345,
        ref: 'data-123',
      },
    ],
  }
  handleRemoteOperation(operation)
  expect(subscriptionsStore.size).toEqual(0)
})
