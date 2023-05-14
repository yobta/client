import {
  YobtaCollectionCreateOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_CHANNEL_DELETE,
  YOBTA_COLLECTION_CREATE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_CHANNEL_INSERT,
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
  const operation: YobtaCollectionCreateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_CREATE,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 1,
    merged: 2,
    channel: 'channel',
  }
  const result = filterKeys([], 'collection', operation)
  expect(result).toEqual(operation)
})
it('does not mutate log', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionCreateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_CREATE,
    data: {
      id: 'id',
      name: 'john',
    },
    channel: 'channel',
    committed: 1,
    merged: 2,
  }
  const logCopy = [...log]
  filterKeys(log, 'collection', operation)
  expect(log).toEqual(logCopy)
})
it('keeps keys when gets newer input', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'item-id',
      collection: 'collection',
      committed: 1,
      merged: 2,
      key: 'id',
      value: 'item-id',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-2',
      snapshotId: 'item-id',
      collection: 'collection',
      committed: 1,
      merged: 2,
      key: 'name',
      value: 'repace-john',
    },
  ]
  const result = filterKeys(log, 'collection', {
    id: 'op-id',
    type: YOBTA_COLLECTION_CREATE,
    data: {
      id: 'item-id',
      name: 'with-jane',
    },
    committed: 2,
    merged: 3,
    channel: 'channel',
  })
  expect(result).toEqual({
    id: 'op-id',
    type: YOBTA_COLLECTION_CREATE,
    data: {
      id: 'item-id',
      name: 'with-jane',
    },
    committed: 2,
    merged: 3,
    channel: 'channel',
  })
})
it('keeps id key for update operation', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_UPDATE,
    data: {
      id: 'id',
      name: 'jane',
    },
    committed: 2,
    merged: 3,
    channel: 'channel',
  }
  const result = filterKeys(log, 'collection', operation)
  expect(result).toEqual({
    id: 'op-id',
    type: YOBTA_COLLECTION_UPDATE,
    data: { id: 'id', name: 'jane' },
    committed: 2,
    merged: 3,
    channel: 'channel',
  })
})
it('omits keys when committed is same as in log', () => {
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
  const operation: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_UPDATE,
    data: {
      id: 'id',
      name: 'jane',
    },
    committed: 2,
    merged: 3,
    channel: 'channel',
  }
  const result = filterKeys(log, 'collection', operation)
  expect(result).toEqual({
    id: 'op-id',
    type: YOBTA_COLLECTION_UPDATE,
    data: { id: 'id' },
    committed: 2,
    merged: 3,
    channel: 'channel',
  })
})
it('omits key and id if committed is less then in log', () => {
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
  const operation: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_UPDATE,
    data: {
      id: 'id',
      name: 'janex',
    },
    committed: 3,
    merged: 4,
    channel: 'channel',
  }
  const result = filterKeys(log, 'collection', operation)
  expect(result).toEqual({
    id: 'op-id',
    type: YOBTA_COLLECTION_UPDATE,
    data: { id: 'id' },
    committed: 3,
    merged: 4,
    channel: 'channel',
  })
})
it('has no issues with rest log entry types', () => {
  const insertEntry: YobtaServerLogChannelInsertEntry = {
    type: YOBTA_CHANNEL_INSERT,
    operationId: 'op-id-1',
    snapshotId: 'id',
    channel: 'channel',
    collection: 'collection',
    committed: 1,
    merged: 2,
  }
  const deleteEntry: YobtaServerLogChannelDeleteEntry = {
    type: YOBTA_CHANNEL_DELETE,
    operationId: 'op-id-2',
    snapshotId: 'id',
    channel: 'channel',
    collection: 'collection',
    committed: 3,
    merged: 4,
  }
  const restoreEntry: YobtaServerLogChannelRestoreEntry = {
    type: YOBTA_CHANNEL_RESTORE,
    operationId: 'op-id-3',
    snapshotId: 'id',
    channel: 'channel',
    collection: 'collection',
    committed: 5,
    merged: 6,
  }
  const moveEntry: YobtaServerLogChannelMoveEntry = {
    type: YOBTA_CHANNEL_SHIFT,
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
  const operation: YobtaCollectionCreateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_CREATE,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 1,
    merged: 2,
    channel: 'channel',
  }
  const result = filterKeys(log, 'collection', operation)
  expect(result).toEqual(operation)
})
it('returns a copy of input operation', () => {
  const operation: YobtaCollectionCreateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_CREATE,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 1,
    merged: 2,
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
      id: 'id',
      name: 'john',
    },
    committed: 1,
    merged: 2,
    channel: 'channel',
  }
  const result = filterKeys([], 'collection', operation)
  expect(result).not.toBe(operation)
  expect(result.data).not.toBe(operation.data)
})
