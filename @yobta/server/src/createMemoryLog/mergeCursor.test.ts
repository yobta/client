import {
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'
import { mergeCursor } from './mergeCursor.js'

type Snapshot = {
  id: string
  name: string
}

it('returns same log if operation is not insert', () => {
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
  const result = mergeCursor([], 'collection', operation)
  expect(result).toEqual([])
})

it('appends insert operation to log', () => {
  const log: YobtaServerLogItem[] = [
    {
      snapshotId: 'id-1',
      collection: 'collection',
      committed: 2,
      channel: 'channel',
      merged: 3,
      nextSnapshotId: undefined,
      deleted: false,
    },
  ]
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-2',
      name: 'john',
    },
    committed: 2,
    merged: 0,
    snapshotId: 'id-2',
    channel: 'channel',
  }
  const result = mergeCursor(log, 'collection', operation)
  expect(result).toEqual([
    ...log,
    {
      snapshotId: 'id-2',
      collection: 'collection',
      committed: 2,
      channel: 'channel',
      merged: expect.any(Number),
      nextSnapshotId: undefined,
      deleted: false,
    },
  ])
})

it('updates existing operation with the new operation', () => {
  const log: YobtaServerLogItem[] = [
    {
      snapshotId: 'id-1',
      collection: 'collection',
      committed: 2,
      channel: 'channel',
      merged: 3,
      nextSnapshotId: undefined,
      deleted: true,
    },
  ]
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-1',
      name: 'john',
    },
    committed: 3,
    merged: 0,
    snapshotId: 'id-1',
    channel: 'channel',
  }
  const result = mergeCursor(log, 'collection', operation)
  expect(result).toEqual([
    {
      snapshotId: 'id-1',
      collection: 'collection',
      committed: 3,
      channel: 'channel',
      merged: expect.any(Number),
      nextSnapshotId: undefined,
      deleted: false,
    },
  ])
})

it('ignores insert operation if the committed is the same', () => {
  const log: YobtaServerLogItem[] = [
    {
      snapshotId: 'id-1',
      collection: 'collection',
      committed: 2,
      channel: 'channel',
      merged: 3,
      nextSnapshotId: undefined,
      deleted: false,
    },
    {
      snapshotId: 'id-2',
      collection: 'collection',
      committed: 3,
      channel: 'channel',
      merged: 4,
      nextSnapshotId: undefined,
      deleted: false,
    },
  ]
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-1',
      name: 'john',
    },
    committed: 2,
    merged: 0,
    snapshotId: 'id-1',
    channel: 'channel',
  }
  const result = mergeCursor(log, 'collection', operation)
  expect(result).toEqual(log)
})

it('ignores insert operation if the committed is less then in log', () => {
  const log: YobtaServerLogItem[] = [
    {
      snapshotId: 'id-1',
      collection: 'collection',
      committed: 2,
      channel: 'channel',
      merged: 3,
      nextSnapshotId: undefined,
      deleted: false,
    },
  ]
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-1',
      name: 'john',
    },
    committed: 1,
    merged: 0,
    snapshotId: 'id-1',
    channel: 'channel',
  }
  const result = mergeCursor(log, 'collection', operation)
  expect(result).toEqual(log)
})
