import { YOBTA_COLLECTION_INSERT } from '@yobta/protocol'

import { YobtaLogEntry } from '../createLog/createLog.js'
import { parseLogEntry } from './parseLogEntry.js'

it('creates object from entry', () => {
  const entry: YobtaLogEntry = [
    'op-id',
    'channel',
    1,
    2,
    YOBTA_COLLECTION_INSERT,
    'snapshot-2',
    'snapshot-1',
    undefined,
  ]
  const object = parseLogEntry(entry)
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
