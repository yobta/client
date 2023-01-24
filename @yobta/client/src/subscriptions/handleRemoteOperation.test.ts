import { createErrorYobta } from '../errorsStore/errorsStore.js'
import {
  YobtaCommit,
  YobtaError,
  YobtaCollectionInsert,
  YobtaRemoteOperation,
  YobtaReject,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COMMIT,
  YOBTA_ERROR,
  YOBTA_RECEIVED,
  YOBTA_REJECT,
  YOBTA_BATCH,
  YobtaBatchOperation,
} from '../protocol/protocol.js'
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
  let operation: YobtaRemoteOperation = {
    type: YOBTA_RECEIVED,
    id: 'message-123',
    ref: 'operation-123',
    time: 123,
  }
  handleRemoteOperation(operation)
  expect(dequeueOperationAndFixTime).toHaveBeenCalledWith(operation)
})

it('should add error', () => {
  let operation: YobtaError = {
    type: YOBTA_ERROR,
    id: 'message-123',
    message: 'error-message',
    time: 123,
  }
  handleRemoteOperation(operation)

  expect(createErrorYobta).toBeCalledWith(operation)
  expect(subscriptionsStore.size).toEqual(0)
})

it('should add a remote operation to the committed list for a valid channel', () => {
  let subscription = getSubscription('channel-123', [])
  let operation: YobtaBatchOperation = {
    type: YOBTA_BATCH,
    id: 'message-123',
    channel: 'channel-123',
    operations: [
      {
        type: YOBTA_COLLECTION_INSERT,
        id: 'operation-123',
        channel: 'channel-123',
        time: 123,
        data: { id: 'data-123' },
      },
    ],
  }
  handleRemoteOperation(operation)
  expect(subscription.committed.last()).toEqual(operation.operations[0])
})

it('should remove a pending operation and add it to the committed list for a commit message', () => {
  let subscription = getSubscription('channel-123', [])
  let operation: YobtaCollectionInsert = {
    type: YOBTA_COLLECTION_INSERT,
    id: 'operation-123',
    channel: 'channel-123',
    time: 123,
    data: { id: 'data-123' },
  }
  subscription.pending.add(operation)

  let commitOperation: YobtaCommit = {
    type: YOBTA_COMMIT,
    id: 'operation-123',
    time: 1234,
    channel: 'channel-123',
    ref: 'operation-123',
  }
  handleRemoteOperation(commitOperation)

  expect(subscription.pending.last()).toBeUndefined()
  expect(subscription.committed.last()).toEqual({ ...operation, time: 1234 })
})

it('should remove a pending operation for a revert message', () => {
  let subscription = getSubscription('channel-123', [])
  let operation: YobtaCollectionInsert = {
    type: YOBTA_COLLECTION_INSERT,
    id: 'operation-123',
    channel: 'channel-123',
    time: 123,
    data: { id: 'data-123' },
  }
  subscription.pending.add(operation)

  let rejectOperation: YobtaReject = {
    type: YOBTA_REJECT,
    id: 'operation-123',
    channel: 'channel-123',
    time: 1234,
    ref: 'operation-123',
    reason: 'revert',
  }
  handleRemoteOperation(rejectOperation)

  expect(subscription.pending.last()).toBeUndefined()
})

it('should not notify subscribers after received operation', () => {
  let subscription = getSubscription('channel-123', [])
  let subscriber = vi.fn()
  subscription.subscribers.add(subscriber)
  let operation: YobtaRemoteOperation = {
    type: YOBTA_RECEIVED,
    id: 'message-123',
    ref: 'operation-123',
    time: 123,
  }
  handleRemoteOperation(operation)
  expect(subscriber).not.toBeCalled()
})

it('should not notify subscribers after error operation', () => {
  let subscription = getSubscription('channel-123', [])
  let subscriber = vi.fn()
  subscription.subscribers.add(subscriber)
  let operation: YobtaError = {
    type: YOBTA_ERROR,
    id: 'message-123',
    time: 123,
    message: 'error-message',
  }
  handleRemoteOperation(operation)
  expect(subscriber).not.toBeCalled()
})

it('it should notify subscribers for the rest operations', () => {
  let subscription = getSubscription('channel-123', [])
  let subscriber = vi.fn()
  subscription.subscribers.add(subscriber)
  let operation: YobtaBatchOperation = {
    channel: 'channel-123',
    type: YOBTA_BATCH,
    id: 'message-123',
    operations: [
      {
        type: YOBTA_COLLECTION_INSERT,
        id: 'operation-123',
        channel: 'channel-123',
        time: 123,
        data: { id: 'data-123' },
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
  let operation: YobtaBatchOperation = {
    channel: 'channel-123',
    type: YOBTA_BATCH,
    id: 'message-123',
    operations: [
      {
        type: YOBTA_COLLECTION_INSERT,
        id: 'operation-123',
        channel: 'channel-123',
        time: 123,
        data: { id: 'data-123' },
      },
    ],
  }
  handleRemoteOperation(operation)
  expect(subscriptionsStore.size).toEqual(0)
})
