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
  const log: YobtaServerLogItem[] = []
  const result = mergeCursor(log, 'collection', operation)
  expect(result).toBe(log)
  expect(result).toEqual(log)
})
it('inserts appends new entry to empty log', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-2',
      name: 'john',
    },
    committed: 4,
    merged: 0,
    snapshotId: 'id-2',
    channel: 'channel',
  }
  const result = mergeCursor(log, 'collection', operation)
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_INSERT,
      snapshotId: 'id-2',
      collection: 'collection',
      committed: 4,
      channel: 'channel',
      merged: expect.any(Number),
      nextSnapshotId: undefined,
    },
  ])
})
it('updates merged to the current time', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-2',
      name: 'john',
    },
    committed: 4,
    merged: 0,
    snapshotId: 'id-2',
    channel: 'channel',
  }
  const result = mergeCursor(log, 'collection', operation)
  expect(result[0].merged).toBeCloseTo(Date.now(), -10)
})
it('appends new entry to filled log', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_INSERT,
      snapshotId: 'id-1',
      collection: 'collection',
      committed: 2,
      channel: 'channel',
      merged: 3,
      nextSnapshotId: undefined,
    },
  ]
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-2',
      name: 'john',
    },
    committed: 4,
    merged: 0,
    snapshotId: 'id-2',
    channel: 'channel',
  }
  const result = mergeCursor(log, 'collection', operation)
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_INSERT,
      snapshotId: 'id-1',
      collection: 'collection',
      committed: 2,
      channel: 'channel',
      merged: 3,
      nextSnapshotId: undefined,
    },
    {
      type: YOBTA_COLLECTION_INSERT,
      snapshotId: 'id-2',
      collection: 'collection',
      committed: 4,
      channel: 'channel',
      merged: expect.any(Number),
      nextSnapshotId: undefined,
    },
  ])
})
it('does not mutate the log', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-2',
      name: 'john',
    },
    committed: 4,
    merged: 0,
    snapshotId: 'id-2',
    channel: 'channel',
  }
  const result = mergeCursor(log, 'collection', operation)
  expect(result).toBe(log)
  expect(result).toEqual(log)
  expect(result.length).toBe(1)
})
it('is idempotant', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_INSERT,
      snapshotId: 'id-1',
      collection: 'collection',
      committed: 2,
      channel: 'channel',
      merged: 3,
      nextSnapshotId: undefined,
    },
  ]
  mergeCursor(log, 'collection', {
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
  })
  mergeCursor(log, 'collection', {
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
  })
  const result = mergeCursor(log, 'collection', {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-1',
      name: 'john',
    },
    committed: 4,
    merged: 0,
    snapshotId: 'id-1',
    channel: 'channel',
  })
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_INSERT,
      snapshotId: 'id-1',
      collection: 'collection',
      channel: 'channel',
      committed: 2,
      merged: 3,
      nextSnapshotId: undefined,
    },
  ])
})
