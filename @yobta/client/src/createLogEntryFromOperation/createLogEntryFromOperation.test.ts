import {
  YobtaCollectionInsertOperation,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { createLogEntryFromOperation } from './createLogEntryFromOperation.js'

type MockSnapshot = { id: string; key: string }

it('creates entries from insert operatoins', () => {
  const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
    id: 'op-id',
    committed: 1,
    merged: 2,
    snapshotId: 'snapshot-2',
    nextSnapshotId: 'snapshot-1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  }
  const entry = createLogEntryFromOperation(insertOpetaion)
  expect(entry).toEqual([
    'op-id',
    'channel',
    1,
    2,
    YOBTA_COLLECTION_INSERT,
    'snapshot-2',
    'snapshot-1',
    undefined,
  ])
})
it('creates entries from reject operatoins', () => {
  const rejectOpetaion: YobtaRejectOperation = {
    id: 'op-id',
    channel: 'channel',
    committed: 1,
    merged: 2,
    operationId: 'op-id',
    reason: 'reason',
    type: YOBTA_REJECT,
  }
  const entry = createLogEntryFromOperation(rejectOpetaion)
  expect(entry).toEqual([
    'op-id',
    'channel',
    1,
    2,
    YOBTA_REJECT,
    undefined,
    undefined,
    'op-id',
  ])
})
