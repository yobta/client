import { YOBTA_COLLECTION_INSERT } from '@yobta/protocol'

import { YobtaLogEntry } from './createLog.js'
import { insertEntry } from './insertEntry.js'

it('isterts entry to empty log', () => {
  const log: YobtaLogEntry[] = []
  const entry: YobtaLogEntry = [
    'op-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_INSERT,
    'snapshotId',
    'nextSnapshotId',
    undefined,
  ]
  insertEntry(log, entry)
  expect(log).toEqual([entry])
})

it('inserts entry at the beginning', () => {
  const entry1: YobtaLogEntry = [
    'op-2',
    'channel',
    3,
    3,
    YOBTA_COLLECTION_INSERT,
    'snapshotId2',
    'nextSnapshotId2',
    undefined,
  ]
  const entry2: YobtaLogEntry = [
    'op-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_INSERT,
    'snapshotId',
    'nextSnapshotId',
    undefined,
  ]
  const log: YobtaLogEntry[] = [entry1]
  insertEntry(log, entry2)
  expect(log).toEqual([entry2, entry1])
})

it('inserts entry ar the end', () => {
  const entry1: YobtaLogEntry = [
    'op-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_INSERT,
    'snapshotId',
    'nextSnapshotId',
    undefined,
  ]
  const entry2: YobtaLogEntry = [
    'op-3',
    'channel',
    5,
    5,
    YOBTA_COLLECTION_INSERT,
    'snapshotId3',
    'nextSnapshotId3',
    undefined,
  ]
  const entry3: YobtaLogEntry = [
    'op-2',
    'channel',
    3,
    3,
    YOBTA_COLLECTION_INSERT,
    'snapshotId2',
    'nextSnapshotId2',
    undefined,
  ]
  const log: YobtaLogEntry[] = [entry1, entry2]
  insertEntry(log, entry3)
  expect(log).toEqual([entry1, entry3, entry2])
})

it('inserts entry in the middle', () => {
  const entry1: YobtaLogEntry = [
    'op-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_INSERT,
    'snapshotId',
    'nextSnapshotId',
    undefined,
  ]
  const entry2: YobtaLogEntry = [
    'op-3',
    'channel',
    5,
    5,
    YOBTA_COLLECTION_INSERT,
    'snapshotId3',
    'nextSnapshotId3',
    undefined,
  ]
  const log: YobtaLogEntry[] = [entry1]
  insertEntry(log, entry2)
  expect(log).toEqual([entry1, entry2])
})

it('inserts one-by-one', () => {
  const entry1: YobtaLogEntry = [
    'op-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_INSERT,
    'snapshotId',
    'nextSnapshotId',
    undefined,
  ]
  const entry2: YobtaLogEntry = [
    'op-3',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_INSERT,
    'snapshotId3',
    'nextSnapshotId3',
    undefined,
  ]
  const log: YobtaLogEntry[] = [entry1]
  insertEntry(log, entry2)
  expect(log).toEqual([entry1, entry2])
})
