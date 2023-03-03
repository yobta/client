import {
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YobtaMergeOperation,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_MERGE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import locals, { createLog, YobtaLogEntry } from './createLog.js'

const { mergeEntry, createEntryFromOperation, parseEntry } = locals

type MockSnapshot = { id: string; key: string }

describe('createEntryFromOperation', () => {
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
    const entry = createEntryFromOperation(insertOpetaion)
    expect(entry).toEqual([
      'op-id',
      'channel',
      1,
      2,
      YOBTA_COLLECTION_INSERT,
      'snapshot-2',
      'snapshot-1',
    ])
  })
  it('creates entries from merge operatoins', () => {
    const mergeOpetaion: YobtaMergeOperation = {
      id: 'op-id',
      channel: 'channel',
      committed: 1,
      merged: 2,
      operationId: 'op-id',
      type: YOBTA_MERGE,
    }
    const entry = createEntryFromOperation(mergeOpetaion)
    expect(entry).toEqual([
      'op-id',
      'channel',
      1,
      2,
      YOBTA_MERGE,
      undefined,
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
    const entry = createEntryFromOperation(rejectOpetaion)
    expect(entry).toEqual([
      'op-id',
      'channel',
      1,
      2,
      YOBTA_REJECT,
      undefined,
      undefined,
    ])
  })
})

describe('parseEntry', () => {
  it('creates object from entry', () => {
    const entry: YobtaLogEntry = [
      'op-id',
      'channel',
      1,
      2,
      YOBTA_COLLECTION_INSERT,
      'snapshot-2',
      'snapshot-1',
    ]
    const object = parseEntry(entry)
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
})

describe('mergeEntry', () => {
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
    const nextLog = mergeEntry(log, insertOpetaion)
    expect(nextLog).toEqual([createEntryFromOperation(insertOpetaion)])
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
    mergeEntry(log, insertOpetaion)
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
    ]
    const log: YobtaLogEntry[] = [initialEntry]
    const nextLog = mergeEntry(log, insertOpetaion)
    expect(nextLog).toEqual([
      createEntryFromOperation(insertOpetaion),
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
    ]
    const log: YobtaLogEntry[] = [initialEntry]
    const nextLog = mergeEntry(log, insertOpetaion)
    expect(nextLog).toEqual([
      createEntryFromOperation(insertOpetaion),
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
    const log: YobtaLogEntry[] = [createEntryFromOperation(insertOpetaion)]
    const nextLog = mergeEntry(log, insertOpetaion)
    expect(nextLog).toEqual([createEntryFromOperation(insertOpetaion)])
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
    const log: YobtaLogEntry[] = [createEntryFromOperation(insertOpetaion2)]
    const nextLog = mergeEntry(log, insertOpetaion1)
    expect(nextLog).toEqual([createEntryFromOperation(insertOpetaion1)])
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
    const log: YobtaLogEntry[] = [createEntryFromOperation(insertOpetaion2)]
    const nextLog = mergeEntry(log, insertOpetaion1)
    expect(nextLog).toEqual([createEntryFromOperation(insertOpetaion1)])
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
    const log: YobtaLogEntry[] = [createEntryFromOperation(insertOpetaion2)]
    const nextLog = mergeEntry(log, insertOpetaion1)
    expect(nextLog).toEqual([createEntryFromOperation(insertOpetaion1)])
  })
})

describe('factory', () => {
  it('returns a log object', () => {
    const log = createLog([])
    expect(log).toEqual({
      add: expect.any(Function),
      last: expect.any(Function),
      observe: expect.any(Function),
      on: expect.any(Function),
    })
  })
  it('receives initial state', () => {
    const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const log = createLog([insertOpetaion])
    expect(log.last()).toEqual([createEntryFromOperation(insertOpetaion)])
  })
  it('sorts initial opetations', () => {
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
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    const log = createLog([insertOpetaion2, insertOpetaion1])
    expect(log.last()).toEqual([
      createEntryFromOperation(insertOpetaion1),
      createEntryFromOperation(insertOpetaion2),
    ])
  })
})

describe('add', () => {
  it('supports insert operations', () => {
    const log = createLog([])
    const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    log.add([insertOpetaion])
    expect(log.last()).toEqual([createEntryFromOperation(insertOpetaion)])
  })
  it('supports reject operations', () => {
    const log = createLog([])
    const rejectOpetaion: YobtaRejectOperation = {
      id: '1',
      committed: 1,
      merged: 1,
      operationId: '1',
      type: YOBTA_REJECT,
      channel: 'channel',
      reason: 'reason',
    }
    log.add([rejectOpetaion])
    expect(log.last()).toEqual([createEntryFromOperation(rejectOpetaion)])
  })
  it('supports merge operations', () => {
    const log = createLog([])
    const mergeOpetaion: YobtaMergeOperation = {
      id: '1',
      committed: 1,
      merged: 1,
      operationId: '1',
      type: YOBTA_MERGE,
      channel: 'channel',
    }
    log.add([mergeOpetaion])
    expect(log.last()).toEqual([createEntryFromOperation(mergeOpetaion)])
  })
  it('ignores update operations', () => {
    const log = createLog([])
    const updateOpetaion: YobtaCollectionUpdateOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_UPDATE,
      data: { key: 'value' },
      channel: 'channel',
    }
    log.add([updateOpetaion])
    expect(log.last()).toEqual([])
  })
  it('adds multiple entries', () => {
    const log = createLog([])
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
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    log.add([insertOpetaion1, insertOpetaion2])
    expect(log.last()).toEqual([
      createEntryFromOperation(insertOpetaion1),
      createEntryFromOperation(insertOpetaion2),
    ])
  })
  it('should not mutate the original log', () => {
    const log = createLog([])
    const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const last = log.last()
    log.add([insertOpetaion])
    expect(last).not.toBe(log.last())
  })
  it('should sort entries by committed', () => {
    const log = createLog([])
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
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    log.add([insertOpetaion2, insertOpetaion1])
    expect(log.last()).toEqual([
      createEntryFromOperation(insertOpetaion1),
      createEntryFromOperation(insertOpetaion2),
    ])
  })
  it('should be idempotent', () => {
    const log = createLog([])
    const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    log.add([insertOpetaion])
    const last = log.last()
    log.add([insertOpetaion])
    expect(last).toEqual(log.last())
  })
})

describe('last', () => {
  it('returns empty log state', () => {
    const log = createLog([])
    expect(log.last()).toEqual([])
  })
  it('returns empty array if log is empty', () => {
    const log = createLog([])
    expect(log.last()).toEqual([])
  })
  it('returns all entries', () => {
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
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    const log = createLog([insertOpetaion1, insertOpetaion2])
    expect(log.last()).toEqual([
      createEntryFromOperation(insertOpetaion1),
      createEntryFromOperation(insertOpetaion2),
    ])
  })
})

describe('observe', () => {
  it('receives updates', () => {
    const log = createLog([])
    const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const observer = vi.fn()
    log.observe(observer)
    log.add([insertOpetaion])
    expect(observer).toHaveBeenCalledWith([
      createEntryFromOperation(insertOpetaion),
    ])
  })
  it('should not receive updates when there are no changes', () => {
    const log = createLog([])
    const observer = vi.fn()
    const updateOpetaion: YobtaCollectionUpdateOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_UPDATE,
      data: { key: 'value' },
      channel: 'channel',
    }
    log.observe(observer)
    log.add([updateOpetaion])
    expect(observer).not.toHaveBeenCalled()
  })
})
