import {
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'
import { mergeData } from './mergeData.js'

type Snapshot = {
  id: string
  name: string
}

it('adds inserted key entries to empty log', () => {
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
  const result = mergeData([], 'test', operation)
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: 'id-2',
      collection: 'test',
      committed: 2,
      merged: expect.any(Number),
      key: 'id',
      value: 'id-2',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: 'id-2',
      collection: 'test',
      committed: 2,
      merged: expect.any(Number),
      key: 'name',
      value: 'john',
    },
  ])
})

it('is immutable', () => {
  const log: YobtaServerLogItem[] = []
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
  const result = mergeData(log, 'test', operation)
  expect(result).not.toBe(log)
})

it('adds inserted key entries to populated log', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: 'id-1',
      collection: 'test',
      committed: 1,
      merged: 6,
      key: 'some key',
      value: 'some value',
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
  const result = mergeData(log, 'test', operation)
  expect(result).toEqual([
    ...log,
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: 'id-2',
      collection: 'test',
      committed: 2,
      merged: expect.any(Number),
      key: 'id',
      value: 'id-2',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: 'id-2',
      collection: 'test',
      committed: 2,
      merged: expect.any(Number),
      key: 'name',
      value: 'john',
    },
  ])
})

it('adds updated key entries to empty log', () => {
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
  const result = mergeData([], 'test', operation)
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: 'id',
      collection: 'test',
      committed: 1,
      merged: expect.any(Number),
      key: 'name',
      value: 'john',
    },
  ])
})

it('overwrites updated log entry', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: 'id-1',
      collection: 'test',
      committed: 1,
      merged: 2,
      key: 'name',
      value: 'john',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
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
      name: 'jane',
    },
    committed: 5,
    merged: 0,
    snapshotId: 'id-1',
    channel: 'channel',
  }
  const result = mergeData(log, 'test', operation)
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: 'id-1',
      collection: 'test',
      committed: 5,
      merged: expect.any(Number),
      key: 'name',
      value: 'jane',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
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
      snapshotId: 'id-1',
      collection: 'test-collection',
      committed: 2,
      merged: 3,
      key: 'name',
      value: 'john',
    },
  ]
  expect(() =>
    mergeData(log, 'test-collection', {
      id: 'op-id',
      type: YOBTA_COLLECTION_UPDATE,
      data: {
        name: 'jane',
      },
      committed: 1,
      merged: 0,
      snapshotId: 'id-1',
      channel: 'channel',
    }),
  ).toThrow()
  expect(() =>
    mergeData(log, 'test-collection', {
      id: 'op-id',
      type: YOBTA_COLLECTION_UPDATE,
      data: {
        name: 'jane',
      },
      committed: 2,
      merged: 0,
      snapshotId: 'id-1',
      channel: 'channel',
    }),
  ).toThrow()
})
