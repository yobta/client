import {
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_INSERT,
} from '@yobta/protocol'

import { insertEntry } from './insertEntry.js'

type Snapshot = {
  id: string
}

it('inserts entry to empty log', () => {
  const log: any = []
  const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1' },
    snapshotId: '1',
  }
  insertEntry(log, insertOperation)
  expect(log).toEqual([insertOperation])
})

it('inserts entry at the beginning', () => {
  const insert1: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-2',
    channel: 'channel',
    committed: 3,
    merged: 3,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '2' },
    snapshotId: '2',
  }
  const insert2: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1' },
    snapshotId: '1',
  }
  const log = [insert1]
  insertEntry(log, insert2)
  expect(log).toEqual([insert2, insert1])
})

it('inserts entry in the middle', () => {
  const insert1: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1' },
    snapshotId: '1',
  }
  const insert2: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-3',
    channel: 'channel',
    committed: 5,
    merged: 5,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '3' },
    snapshotId: '3',
  }
  const insert3: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-2',
    channel: 'channel',
    committed: 3,
    merged: 3,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '2' },
    snapshotId: '2',
  }
  const log = [insert1, insert2]
  insertEntry(log, insert3)
  expect(log).toEqual([insert1, insert3, insert2])
})

it('inserts entry at the end', () => {
  const insert1: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1' },
    snapshotId: '1',
  }
  const insert2: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-3',
    channel: 'channel',
    committed: 5,
    merged: 5,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '3' },
    snapshotId: '3',
  }
  const log = [insert1]
  insertEntry(log, insert2)
  expect(log).toEqual([insert1, insert2])
})

it('inserts one-by-one', () => {
  const insert1: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1' },
    snapshotId: '1',
  }
  const insert2: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-2',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '2' },
    snapshotId: '2',
  }
  const log = [insert1]
  insertEntry(log, insert2)
  expect(log).toEqual([insert1, insert2])
})
