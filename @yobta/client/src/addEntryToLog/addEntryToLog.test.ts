import {
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_INSERT,
} from '@yobta/protocol'

import { YobtaLogEntry } from '../createLog/createLog.js'
import { createLogEntryFromOperation } from '../createLogEntryFromOperation/createLogEntryFromOperation.js'
import { addEntryToLog } from './addEntryToLog.js'

type MockSnapshot = { id: string; key: string }

it('inserts new entry', () => {
  const log: YobtaLogEntry[] = []
  const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 1,
    merged: 1,
    snapshotId: '1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const nextLog = addEntryToLog(log, insertOpetaion)
  expect(nextLog).toEqual([createLogEntryFromOperation(insertOpetaion)])
})
it('should not mutate the original log', () => {
  const log: YobtaLogEntry[] = []
  const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 1,
    merged: 1,
    snapshotId: '1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  addEntryToLog(log, insertOpetaion)
  expect(log).toEqual([])
})
it('should sort entries by committed', () => {
  const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 1,
    merged: 1,
    snapshotId: '1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const initialEntry: YobtaLogEntry = [
    '2',
    'channel',
    2,
    2,
    YOBTA_COLLECTION_INSERT,
    '2',
    undefined,
    undefined,
  ]
  const log: YobtaLogEntry[] = [initialEntry]
  const nextLog = addEntryToLog(log, insertOpetaion)
  expect(nextLog).toEqual([
    createLogEntryFromOperation(insertOpetaion),
    initialEntry,
  ])
})
it('should sort entries one by one when committed is equal', () => {
  const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 1,
    merged: 1,
    snapshotId: '1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const initialEntry: YobtaLogEntry = [
    '2',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_INSERT,
    '2',
    undefined,
    undefined,
  ]
  const log: YobtaLogEntry[] = [initialEntry]
  const nextLog = addEntryToLog(log, insertOpetaion)
  expect(nextLog).toEqual([
    createLogEntryFromOperation(insertOpetaion),
    initialEntry,
  ])
})
it('should be idempotent', () => {
  const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 1,
    merged: 1,
    snapshotId: '1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const log: YobtaLogEntry[] = [createLogEntryFromOperation(insertOpetaion)]
  const nextLog = addEntryToLog(log, insertOpetaion)
  expect(nextLog).toEqual([createLogEntryFromOperation(insertOpetaion)])
})
it('should replace existing entry when new commited is less then old', () => {
  const insertOpetaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 1,
    merged: 1,
    snapshotId: '1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const insertOpetaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 2,
    merged: 2,
    snapshotId: '2',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const log: YobtaLogEntry[] = [createLogEntryFromOperation(insertOpetaion2)]
  const nextLog = addEntryToLog(log, insertOpetaion1)
  expect(nextLog).toEqual([createLogEntryFromOperation(insertOpetaion1)])
})
it('should replace existing entry when new commited is equal to old', () => {
  const insertOpetaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 1,
    merged: 1,
    snapshotId: '1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const insertOpetaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 1,
    merged: 2,
    snapshotId: '2',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const log: YobtaLogEntry[] = [createLogEntryFromOperation(insertOpetaion2)]
  const nextLog = addEntryToLog(log, insertOpetaion1)
  expect(nextLog).toEqual([createLogEntryFromOperation(insertOpetaion1)])
})
it('should replace existing entry when new commited is greater then old', () => {
  const insertOpetaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 2,
    merged: 2,
    snapshotId: '2',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const insertOpetaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: '1',
    committed: 1,
    merged: 1,
    snapshotId: '1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const log: YobtaLogEntry[] = [createLogEntryFromOperation(insertOpetaion2)]
  const nextLog = addEntryToLog(log, insertOpetaion1)
  expect(nextLog).toEqual([createLogEntryFromOperation(insertOpetaion1)])
})
// it('should update entry sort when merged is greater then old', () => {
//   const insertOpetaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
//     id: '1',
//     committed: 1,
//     merged: 0,
//     snapshotId: '1',
//     type: YOBTA_COLLECTION_INSERT,
//     data: { id: '1', key: 'value' },
//     channel: 'channel',
//   }
//   const insertOpetaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
//     id: '2',
//     committed: 2,
//     merged: 2,
//     snapshotId: '2',
//     type: YOBTA_COLLECTION_INSERT,
//     data: { id: '2', key: 'value' },
//     channel: 'channel',
//   }
//   const mergeOp: YobtaaddEntryToLog = {
//     id: '3',
//     committed: 3,
//     merged: 3,
//     channel: 'channel',
//     type: YOBTA_MERGE,
//     operationId: '1',
//   }
//   const log: YobtaLogEntry[] = [
//     createLogEntryFromOperation(insertOpetaion1),
//     createLogEntryFromOperation(insertOpetaion2),
//   ]
//   const nextLog = addEntryToLog(log, mergeOp)
//   expect(nextLog).toEqual([
//     createLogEntryFromOperation(insertOpetaion2),
//     createLogEntryFromOperation({
//       id: '1',
//       committed: 3,
//       merged: 3,
//       snapshotId: '1',
//       type: YOBTA_COLLECTION_INSERT,
//       data: { id: '1', key: 'value' },
//       channel: 'channel',
//     }),
//     createLogEntryFromOperation(mergeOp),
//   ])
// })
