import {
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { createLogEntryFromOperation } from './createLogEntryFromOperation.js'

it('supports insertions', () => {
  const entry = createLogEntryFromOperation({
    id: 'op-id',
    committed: 1,
    merged: 2,
    snapshotId: 'snapshot-2',
    nextSnapshotId: 'snapshot-1',
    type: YOBTA_COLLECTION_INSERT,
    data: { id: '1', key: 'value' },
    channel: 'channel',
  })
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
it('supports revalidations', () => {
  const entry = createLogEntryFromOperation({
    id: 'op-id',
    committed: 1,
    merged: 2,
    snapshotId: 'snapshot-2',
    nextSnapshotId: 'snapshot-1',
    type: YOBTA_COLLECTION_REVALIDATE,
    data: [
      ['id', '1', 1, 2],
      ['name', 'john', 3, 4],
    ],
    channel: 'channel',
  })
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
it('supports move operations', () => {
  const entry = createLogEntryFromOperation({
    id: 'op-id',
    committed: 1,
    merged: 2,
    snapshotId: 'snapshot-2',
    nextSnapshotId: 'snapshot-1',
    type: YOBTA_COLLECTION_MOVE,
    channel: 'channel',
  })
  expect(entry).toEqual([
    'op-id',
    'channel',
    1,
    2,
    YOBTA_COLLECTION_MOVE,
    'snapshot-2',
    'snapshot-1',
    undefined,
  ])
})
it('supports deletions', () => {
  const entry = createLogEntryFromOperation({
    id: 'op-id',
    committed: 1,
    merged: 2,
    snapshotId: 'snapshot-2',
    type: YOBTA_COLLECTION_DELETE,
    channel: 'channel',
  })
  expect(entry).toEqual([
    'op-id',
    'channel',
    1,
    2,
    YOBTA_COLLECTION_DELETE,
    'snapshot-2',
    undefined,
    undefined,
  ])
})
it('supports restores', () => {
  const entry = createLogEntryFromOperation({
    id: 'op-id',
    committed: 1,
    merged: 2,
    snapshotId: 'snapshot-2',
    type: YOBTA_COLLECTION_RESTORE,
    channel: 'channel',
  })
  expect(entry).toEqual([
    'op-id',
    'channel',
    1,
    2,
    YOBTA_COLLECTION_RESTORE,
    'snapshot-2',
    undefined,
    undefined,
  ])
})
it('supports rejections', () => {
  const entry = createLogEntryFromOperation({
    id: 'op-id',
    channel: 'channel',
    committed: 1,
    merged: 2,
    operationId: 'op-id',
    reason: 'reason',
    type: YOBTA_REJECT,
  })
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
it('throws on unknown operation type', () => {
  expect(() =>
    createLogEntryFromOperation({
      id: 'op-id',
      channel: 'channel',
      committed: 1,
      merged: 2,
      operationId: 'op-id',
      reason: 'reason',
      type: 'unknown' as any,
    }),
  ).toThrow('Unknown operation type: unknown')
})
