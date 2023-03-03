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

import locals, { createLog, YobtaLogState } from './createLog.js'

const { insertEntry } = locals

type MockSnapshot = { id: string; key: string }

describe('insertEntry', () => {
  it('inserts new entry', () => {
    const log: YobtaLogState = []
    const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const nextLog = insertEntry(log, insertOpetaion)
    expect(nextLog).toEqual([insertOpetaion])
  })
  it('should not mutate the original log', () => {
    const log: YobtaLogState = []
    const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    insertEntry(log, insertOpetaion)
    expect(log).toEqual([])
  })
  it('should sort entries by committed', () => {
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
    const log: YobtaLogState = [insertOpetaion2]
    const nextLog = insertEntry(log, insertOpetaion1)
    expect(nextLog).toEqual([insertOpetaion1, insertOpetaion2])
  })
  it('should sort entries one by one when committed is equal', () => {
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
      committed: 1,
      merged: 1,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    const log: YobtaLogState = [insertOpetaion2]
    const nextLog = insertEntry(log, insertOpetaion1)
    expect(nextLog).toEqual([insertOpetaion1, insertOpetaion2])
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
    const log: YobtaLogState = [insertOpetaion]
    const nextLog = insertEntry(log, insertOpetaion)
    expect(nextLog).toEqual([insertOpetaion])
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
    const log: YobtaLogState = [insertOpetaion2]
    const nextLog = insertEntry(log, insertOpetaion1)
    expect(nextLog).toEqual([insertOpetaion1])
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
    const log: YobtaLogState = [insertOpetaion2]
    const nextLog = insertEntry(log, insertOpetaion1)
    expect(nextLog).toEqual([insertOpetaion1])
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
    const log: YobtaLogState = [insertOpetaion2]
    const nextLog = insertEntry(log, insertOpetaion1)
    expect(nextLog).toEqual([insertOpetaion1])
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
    expect(log.last()).toEqual([insertOpetaion])
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
    expect(log.last()).toEqual([insertOpetaion1, insertOpetaion2])
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
    expect(log.last()).toEqual([insertOpetaion])
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
    expect(log.last()).toEqual([rejectOpetaion])
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
    expect(log.last()).toEqual([mergeOpetaion])
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
    expect(log.last()).toEqual([insertOpetaion1, insertOpetaion2])
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
    expect(log.last()).toEqual([insertOpetaion1, insertOpetaion2])
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
  it('returns empty map if log is empty', () => {
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
    expect(log.last()).toEqual([insertOpetaion])
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
    expect(observer).toHaveBeenCalledWith([insertOpetaion])
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
