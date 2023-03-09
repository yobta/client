import { vi } from 'vitest'
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionUpdateOperation,
  YobtaRejectOperation,
  YOBTA_REJECT,
  YOBTA_COLLECTION_UPDATE,
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_INSERT,
} from '@yobta/protocol'

import {
  notifyOperationObservers,
  operationResult,
  operationResultObservers,
} from './operationResult.js'

beforeEach(() => {
  operationResultObservers.clear()
})

it('should call all registered observers with the operation argument', () => {
  const observer1 = vi.fn()
  const observer2 = vi.fn()
  const mockOperation: YobtaRejectOperation = {
    id: 'operation-2',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    operationId: 'operation-1',
    type: YOBTA_REJECT,
    reason: 'Operation was rejected',
  }

  operationResultObservers.add(observer1)
  operationResultObservers.add(observer2)
  notifyOperationObservers(mockOperation)
  expect(observer1).toBeCalledWith(mockOperation)
  expect(observer2).toBeCalledWith(mockOperation)
  expect(operationResultObservers.size).toBe(2)
})

it('should resolve and remove observer when the update operation is merged', () => {
  const mockOperation: YobtaCollectionUpdateOperation<YobtaCollectionAnySnapshot> =
    {
      id: 'operation-1',
      channel: 'channel-1',
      committed: 123456789,
      merged: 123456789,
      type: YOBTA_COLLECTION_UPDATE,
      data: {},
      snapshotId: 'snapshot-1',
    }
  const promise = operationResult('operation-1')
  notifyOperationObservers(mockOperation)
  expect(promise).resolves.toBeUndefined()
  expect(operationResultObservers.size).toBe(0)
})

it('should resolve and remove observer when the insert operation is merged', () => {
  const mockOperation: YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot> =
    {
      id: 'operation-1',
      channel: 'channel-1',
      committed: 123456789,
      merged: 123456789,
      type: YOBTA_COLLECTION_INSERT,
      data: { id: 'snapshot-1' },
      snapshotId: 'snapshot-1',
    }
  const promise = operationResult('operation-1')
  notifyOperationObservers(mockOperation)
  expect(promise).resolves.toBeUndefined()
  expect(operationResultObservers.size).toBe(0)
})

it('should reject if the operation is rejected and remove observer', () => {
  const mockOperation: YobtaRejectOperation = {
    id: 'operation-2',
    channel: 'channel-1',
    operationId: 'operation-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_REJECT,
    reason: 'Operation was rejected',
  }

  const promise = operationResult('operation-1')
  expect(operationResultObservers.size).toBe(1)

  notifyOperationObservers(mockOperation)
  expect(promise).rejects.toThrowError(Error('Operation was rejected'))
  expect(operationResultObservers.size).toBe(0)
})

it('should not resolve if the different operation is received', () => {
  const mockOperation: YobtaCollectionUpdateOperation<YobtaCollectionAnySnapshot> =
    {
      id: 'operation-2',
      channel: 'channel-1',
      committed: 123456789,
      merged: 123456789,
      type: YOBTA_COLLECTION_UPDATE,
      data: {},
      snapshotId: 'snapshot-1',
    }
  const promise = operationResult('operation-1')
  notifyOperationObservers(mockOperation)
  expect(promise).resolves.toBeUndefined()
  expect(operationResultObservers.size).toBe(1)
})
