import { vi } from 'vitest'
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionUpdateOperation,
  YobtaRejectOperation,
  YOBTA_REJECT,
  YOBTA_COLLECTION_UPDATE,
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_DELETE,
  YobtaCollectionDeleteOperation,
  YobtaCollectionRestoreOperation,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_MOVE,
  YobtaCollectionMoveOperation,
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

describe('data operations', () => {
  const insert: YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot> = {
    id: 'operation-1',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: 'snapshot-1' },
    snapshotId: 'snapshot-1',
  }
  const update: YobtaCollectionUpdateOperation<YobtaCollectionAnySnapshot> = {
    id: 'operation-1',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_COLLECTION_UPDATE,
    data: {},
    snapshotId: 'snapshot-1',
  }
  const deleteOperation: YobtaCollectionDeleteOperation = {
    id: 'operation-1',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_COLLECTION_DELETE,
    snapshotId: 'snapshot-1',
  }
  const restoreOperation: YobtaCollectionRestoreOperation = {
    id: 'operation-1',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_COLLECTION_RESTORE,
    snapshotId: 'snapshot-1',
  }
  const moveOpration: YobtaCollectionMoveOperation = {
    id: 'operation-1',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_COLLECTION_MOVE,
    snapshotId: 'snapshot-1',
    nextSnapshotId: 'snapshot-2',
  }
  const operations = [
    insert,
    update,
    deleteOperation,
    deleteOperation,
    restoreOperation,
    moveOpration,
  ]
  for (const operation of operations) {
    it(`should resolve and remove observer when the ${operation.type} operation is merged`, () => {
      const promise = operationResult(operation)
      notifyOperationObservers(operation)
      expect(promise).resolves.toBeUndefined()
      expect(operationResultObservers.size).toBe(0)
    })
    it(`should reject if the ${operation.type} operation is rejected and remove observer`, () => {
      const mockServerOperation: YobtaRejectOperation = {
        id: 'operation-2',
        channel: 'channel-1',
        operationId: 'operation-1',
        committed: 123456789,
        merged: 123456789,
        type: YOBTA_REJECT,
        reason: 'Operation was rejected',
      }

      const promise = operationResult(operation)
      expect(operationResultObservers.size).toBe(1)

      notifyOperationObservers(mockServerOperation)
      expect(promise).rejects.toThrowError(Error('Operation was rejected'))
      expect(operationResultObservers.size).toBe(0)
    })
  }
})

it('should not resolve if a different operation is received', () => {
  const promise = operationResult({
    id: 'operation-1',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_COLLECTION_UPDATE,
    data: {},
    snapshotId: 'snapshot-1',
  })
  notifyOperationObservers({
    id: 'operation-2',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_COLLECTION_UPDATE,
    data: {},
    snapshotId: 'snapshot-1',
  })
  expect(promise).resolves.toBeUndefined()
  expect(operationResultObservers.size).toBe(1)
})

it('should not resolve if a different operation is rejected', () => {
  const promise = operationResult({
    id: 'operation-1',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_COLLECTION_UPDATE,
    data: {},
    snapshotId: 'snapshot-1',
  })
  notifyOperationObservers({
    id: 'operation-3',
    channel: 'channel-1',
    committed: 123456789,
    merged: 123456789,
    type: YOBTA_REJECT,
    operationId: 'operation-2',
    reason: 'Operation was rejected',
  })
  expect(promise).resolves.toBeUndefined()
  expect(operationResultObservers.size).toBe(1)
})
