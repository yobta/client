import {
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { parseLogEntry } from './parseLogEntry.js'

it('supports insert entries', () => {
  const object = parseLogEntry([
    'op-id',
    'channel',
    1,
    2,
    YOBTA_COLLECTION_INSERT,
    'snapshot-2',
    'snapshot-1',
    undefined,
  ])
  expect(object).toEqual({
    id: 'op-id',
    channel: 'channel',
    committed: 1,
    merged: 2,
    type: YOBTA_COLLECTION_INSERT,
    snapshotId: 'snapshot-2',
    nextSnapshotId: 'snapshot-1',
  })
})
it('supports reject entries', () => {
  const object = parseLogEntry([
    'op-id',
    'channel',
    1,
    2,
    YOBTA_REJECT,
    undefined,
    undefined,
    'op-id',
  ])
  expect(object).toEqual({
    id: 'op-id',
    channel: 'channel',
    committed: 1,
    merged: 2,
    type: YOBTA_REJECT,
    operationId: 'op-id',
  })
})
it('supports move entries', () => {
  const object = parseLogEntry([
    'op-id',
    'channel',
    1,
    2,
    YOBTA_COLLECTION_MOVE,
    'snapshot-2',
    'snapshot-1',
    undefined,
  ])
  expect(object).toEqual({
    id: 'op-id',
    channel: 'channel',
    committed: 1,
    merged: 2,
    type: YOBTA_COLLECTION_MOVE,
    snapshotId: 'snapshot-2',
    nextSnapshotId: 'snapshot-1',
  })
})
it('supports delete entries', () => {
  const object = parseLogEntry([
    'op-id',
    'channel',
    1,
    2,
    YOBTA_COLLECTION_DELETE,
    'snapshot-2',
    undefined,
    undefined,
  ])
  expect(object).toEqual({
    id: 'op-id',
    channel: 'channel',
    committed: 1,
    merged: 2,
    type: YOBTA_COLLECTION_DELETE,
    snapshotId: 'snapshot-2',
  })
})
it('throws on unknown type', () => {
  expect(() =>
    parseLogEntry([
      'op-id',
      'channel',
      1,
      2,
      'unknown' as any,
      'snapshot-2',
      'snapshot-1',
      undefined,
    ]),
  ).toThrow()
})
