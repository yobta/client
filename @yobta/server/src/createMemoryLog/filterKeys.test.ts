import {
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_REVALIDATE,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'
import { filterKeys } from './filterKeys.js'

type Snapshot = {
  id: string
  name: string
}

it('returns same operation if log is empty', () => {
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

it('returns same operation if committed is greater then in log', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: 'id',
      collection: 'collection',
      committed: 1,
      merged: 2,
      key: 'id',
      value: 'id',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
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
      snapshotId: 'id',
      collection: 'collection',
      committed: 1,
      merged: 2,
      key: 'id',
      value: 'id',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
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
      snapshotId: 'id',
      collection: 'collection',
      committed: 1,
      merged: 2,
      key: 'id',
      value: 'id',
    },
    {
      type: YOBTA_COLLECTION_REVALIDATE,
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
