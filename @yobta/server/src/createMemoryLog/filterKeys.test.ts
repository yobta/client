import {
  YobtaCollectionDeleteOperation,
  YobtaCollectionInsertOperation,
  YobtaCollectionMoveOperation,
  YobtaCollectionRestoreOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import {
  YobtaServerLogChannelDeleteEntry,
  YobtaServerLogChannelInsertEntry,
  YobtaServerLogChannelMoveEntry,
  YobtaServerLogChannelRestoreEntry,
  YobtaServerLogItem,
} from './createMemoryLog.js'
import { filterKeys } from './filterKeys.js'

type Snapshot = {
  id: string
  name: string
}

it('returns same operation.data if log is empty', () => {
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 1,
    merged: 2,
    snapshotId: 'id',
    channel: 'channel',
  }
  const result = filterKeys([], 'collection', operation)
  expect(result).toEqual(operation)
})
it('does not mutate log', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id',
      name: 'john',
    },
    channel: 'channel',
    snapshotId: 'id',
    committed: 1,
    merged: 2,
  }
  const logCopy = [...log]
  filterKeys(log, 'collection', operation)
  expect(log).toEqual(logCopy)
})
it('returns same operation if committed is greater then in log', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'id',
      collection: 'collection',
      committed: 1,
      merged: 2,
      key: 'id',
      value: 'id',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-2',
      snapshotId: 'id',
      collection: 'collection',
      committed: 1,
      merged: 2,
      key: 'name',
      value: 'john',
    },
  ]
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 2,
    merged: 3,
    snapshotId: 'id',
    channel: 'channel',
  }
  const result = filterKeys(log, 'collection', operation)
  expect(result).toEqual(operation)
})
it('omits key if committed is same as in log', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'id',
      collection: 'collection',
      committed: 1,
      merged: 2,
      key: 'id',
      value: 'id',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-2',
      snapshotId: 'id',
      collection: 'collection',
      committed: 2,
      merged: 3,
      key: 'name',
      value: 'john',
    },
  ]
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 2,
    merged: 3,
    snapshotId: 'id',
    channel: 'channel',
  }
  const result = filterKeys(log, 'collection', operation)
  expect(result).toEqual({
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id',
    },
    committed: 2,
    merged: 3,
    snapshotId: 'id',
    channel: 'channel',
  })
})
it('omits key if committed is less then in log', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'id',
      collection: 'collection',
      committed: 1,
      merged: 2,
      key: 'id',
      value: 'id',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-2',
      snapshotId: 'id',
      collection: 'collection',
      committed: 4,
      merged: 5,
      key: 'name',
      value: 'john',
    },
  ]
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 3,
    merged: 4,
    snapshotId: 'id',
    channel: 'channel',
  }
  const result = filterKeys(log, 'collection', operation)
  expect(result).toEqual({
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id',
    },
    committed: 3,
    merged: 4,
    snapshotId: 'id',
    channel: 'channel',
  })
})
it('has no issues with rest log entry types', () => {
  const insertEntry: YobtaServerLogChannelInsertEntry = {
    type: YOBTA_COLLECTION_INSERT,
    operationId: 'op-id-1',
    snapshotId: 'id',
    channel: 'channel',
    collection: 'collection',
    committed: 1,
    merged: 2,
  }
  const deleteEntry: YobtaServerLogChannelDeleteEntry = {
    type: YOBTA_COLLECTION_DELETE,
    operationId: 'op-id-2',
    snapshotId: 'id',
    channel: 'channel',
    collection: 'collection',
    committed: 3,
    merged: 4,
  }
  const restoreEntry: YobtaServerLogChannelRestoreEntry = {
    type: YOBTA_COLLECTION_RESTORE,
    operationId: 'op-id-3',
    snapshotId: 'id',
    channel: 'channel',
    collection: 'collection',
    committed: 5,
    merged: 6,
  }
  const moveEntry: YobtaServerLogChannelMoveEntry = {
    type: YOBTA_COLLECTION_MOVE,
    operationId: 'op-id-4',
    snapshotId: 'id',
    nextSnapshotId: 'id-2',
    channel: 'channel',
    collection: 'collection',
    committed: 5,
    merged: 6,
  }
  const log: YobtaServerLogItem[] = [
    insertEntry,
    deleteEntry,
    restoreEntry,
    moveEntry,
  ]
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 1,
    merged: 2,
    snapshotId: 'id',
    channel: 'channel',
  }
  const result = filterKeys(log, 'collection', operation)
  expect(result).toEqual(operation)
})
it('ignores delete operation', () => {
  const operation: YobtaCollectionDeleteOperation = {
    id: 'op-id',
    type: YOBTA_COLLECTION_DELETE,
    committed: 1,
    merged: 2,
    snapshotId: 'id',
    channel: 'channel',
  }
  const result = filterKeys([], 'collection', operation)
  expect(result).toBe(operation)
})
it('ignores restore operation', () => {
  const operation: YobtaCollectionRestoreOperation = {
    id: 'op-id',
    type: YOBTA_COLLECTION_RESTORE,
    committed: 1,
    merged: 2,
    snapshotId: 'id',
    channel: 'channel',
  }
  const result = filterKeys([], 'collection', operation)
  expect(result).toBe(operation)
})
it('ignores move operation', () => {
  const operation: YobtaCollectionMoveOperation = {
    id: 'op-id',
    type: YOBTA_COLLECTION_MOVE,
    committed: 1,
    merged: 2,
    snapshotId: 'id',
    nextSnapshotId: 'id-2',
    channel: 'channel',
  }
  const result = filterKeys([], 'collection', operation)
  expect(result).toBe(operation)
})
it('returns a copy of input operation', () => {
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 1,
    merged: 2,
    snapshotId: 'id',
    channel: 'channel',
  }
  const result = filterKeys([], 'collection', operation)
  expect(result).not.toBe(operation)
  expect(result.data).not.toBe(operation.data)
})
it('returns a copy of update operation', () => {
  const operation: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_UPDATE,
    data: {
      name: 'john',
    },
    committed: 1,
    merged: 2,
    snapshotId: 'id',
    channel: 'channel',
  }
  const result = filterKeys([], 'collection', operation)
  expect(result).not.toBe(operation)
  expect(result.data).not.toBe(operation.data)
})
