import {
  YobtaChannelDeleteOperation,
  YobtaCollectionCreateOperation,
  YobtaChannelShiftOperation,
  YobtaChannelRestoreOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_CHANNEL_DELETE,
  YOBTA_COLLECTION_CREATE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
  YobtaServerLogItem,
} from '@yobta/protocol'

import { mergeData } from './mergeData.js'

type Snapshot = {
  id: string
  name: string
}

const merged = 456

it('is immutable', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionCreateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_CREATE,
    data: {
      id: 'id-2',
      name: 'john',
    },
    committed: 2,
    merged: 0,
    channel: 'channel',
  }
  const result = mergeData({ log, collection: 'test', merged, operation })
  expect(result).not.toBe(log)
})
it('adds inserted key entries to empty log', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionCreateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_CREATE,
    data: {
      id: 'id-2',
      name: 'john',
    },
    committed: 2,
    merged: 0,
    channel: 'channel',
  }
  const result = mergeData({
    collection: 'test',
    log,
    merged,
    operation,
  })
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id',
      snapshotId: 'id-2',
      collection: 'test',
      committed: 2,
      merged,
      key: 'id',
      value: 'id-2',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id',
      snapshotId: 'id-2',
      collection: 'test',
      committed: 2,
      merged,
      key: 'name',
      value: 'john',
    },
  ])
})
it('adds inserted key entries to populated log', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'id-1',
      collection: 'test',
      committed: 1,
      merged: 6,
      key: 'some key',
      value: 'some value',
    },
  ]
  const operation: YobtaCollectionCreateOperation<Snapshot> = {
    id: 'op-id-2',
    type: YOBTA_COLLECTION_CREATE,
    data: {
      id: 'id-2',
      name: 'john',
    },
    committed: 2,
    merged: 0,
    channel: 'channel',
  }
  const result = mergeData({ log, collection: 'test', merged, operation })
  expect(result).toEqual([
    ...log,
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-2',
      snapshotId: 'id-2',
      collection: 'test',
      committed: 2,
      merged,
      key: 'id',
      value: 'id-2',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-2',
      snapshotId: 'id-2',
      collection: 'test',
      committed: 2,
      merged,
      key: 'name',
      value: 'john',
    },
  ])
})
it('ignores delete operation', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaChannelDeleteOperation = {
    id: 'op-id',
    type: YOBTA_CHANNEL_DELETE,
    channel: 'channel',
    snapshotId: 'id',
    committed: 1,
    merged: 0,
  }
  const result = mergeData({ log, collection: 'test', merged, operation })
  expect(result).toEqual([])
})
it('ignores restore operation', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaChannelRestoreOperation = {
    id: 'op-id',
    type: YOBTA_CHANNEL_RESTORE,
    channel: 'channel',
    snapshotId: 'id',
    committed: 1,
    merged: 0,
  }
  const result = mergeData({ log, collection: 'test', merged, operation })
  expect(result).toEqual([])
})
it('ignores move opetation', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaChannelShiftOperation = {
    id: 'op-id',
    type: YOBTA_CHANNEL_SHIFT,
    channel: 'channel',
    snapshotId: 'id',
    nextSnapshotId: 'id-2',
    committed: 1,
    merged: 0,
  }
  const result = mergeData({ log, collection: 'test', merged, operation })
  expect(result).toEqual([])
})
it('adds updated key entries to empty log', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-id-1',
    type: YOBTA_COLLECTION_UPDATE,
    data: {
      id: 'id',
      name: 'john',
    },
    committed: 1,
    merged: 2,
    channel: 'channel',
  }
  const result = mergeData({ log, collection: 'test', merged, operation })
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      collection: 'test',
      committed: 1,
      merged,
      key: 'name',
      snapshotId: 'id',
      value: 'john',
    },
  ])
})
it('overwrites updated log entry and respects entries order', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'id-1',
      collection: 'test',
      committed: 1,
      merged: 2,
      key: 'id',
      value: 'id-1',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'id-1',
      collection: 'test',
      committed: 1,
      merged: 2,
      key: 'name',
      value: 'john',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-2',
      snapshotId: 'id-1',
      collection: 'test',
      committed: 3,
      merged: 4,
      key: 'some key',
      value: 'some value',
    },
  ]
  const operation: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_UPDATE,
    data: {
      id: 'id-1',
      name: 'jane',
    },
    committed: 5,
    merged: 0,
    channel: 'channel',
  }
  const result = mergeData({ log, collection: 'test', merged, operation })
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'id-1',
      collection: 'test',
      committed: 5,
      merged,
      key: 'id',
      value: 'id-1',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'id-1',
      collection: 'test',
      committed: 5,
      merged,
      key: 'name',
      value: 'jane',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-2',
      snapshotId: 'id-1',
      collection: 'test',
      committed: 3,
      merged: 4,
      key: 'some key',
      value: 'some value',
    },
  ])
})
it('throws when keys are not properly filtered', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      operationId: 'op-id-1',
      snapshotId: 'id-1',
      collection: 'test-collection',
      committed: 2,
      merged: 3,
      key: 'name',
      value: 'john',
    },
  ]
  expect(() =>
    mergeData({
      log,
      collection: 'test-collection',
      merged,
      operation: {
        id: 'op-id',
        type: YOBTA_COLLECTION_UPDATE,
        data: {
          id: 'id-1',
          name: 'jane',
        },
        committed: 1,
        merged: 0,
        channel: 'channel',
      },
    }),
  ).toThrow()
  expect(() =>
    mergeData({
      log,
      collection: 'test-collection',
      merged,
      operation: {
        id: 'op-id',
        type: YOBTA_COLLECTION_UPDATE,
        data: {
          id: 'id-1',
          name: 'jane',
        },
        committed: 2,
        merged: 0,
        channel: 'channel',
      },
    }),
  ).toThrow()
})
