import {
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import locals, { createLog } from './createLog.js'

const { insertEntry } = locals

type MockSnapshot = { id: string; key: string }

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
    expect(log.last()).toEqual(
      new Map([['1', { committed: 1, merged: 1, deleted: false }]]),
    )
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
    expect([...log.last().entries()]).toEqual([
      ['1', { committed: 1, merged: 1, deleted: false }],
      ['2', { committed: 2, merged: 2, deleted: false }],
    ])
  })
})

describe('insertEntry', () => {
  it('inserts new entry', () => {
    const log = new Map()
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
    expect(nextLog).toEqual(
      new Map([['1', { committed: 1, merged: 1, deleted: false }]]),
    )
  })
  it('should not mutate the original log', () => {
    const log = new Map()
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
    expect(log).toEqual(new Map())
  })
  it('should sort entries by committed', () => {
    const log = new Map([
      ['1', { committed: 1, merged: 1, deleted: false }],
      ['3', { committed: 3, merged: 3, deleted: false }],
    ])
    const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    const nextLog = insertEntry(log, insertOpetaion)
    expect([...nextLog.entries()]).toEqual([
      ['1', { committed: 1, merged: 1, deleted: false }],
      ['2', { committed: 2, merged: 2, deleted: false }],
      ['3', { committed: 3, merged: 3, deleted: false }],
    ])
  })
  it('should be idempotent', () => {
    const log = new Map([
      ['1', { committed: 1, merged: 1, deleted: false }],
      ['2', { committed: 2, merged: 2, deleted: false }],
      ['3', { committed: 3, merged: 3, deleted: false }],
    ])
    const insertOpetaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    const nextLog = insertEntry(log, insertOpetaion)
    expect(nextLog).toEqual(log)
  })
})

describe('add', () => {
  it('adds new entry', () => {
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
    expect(log.last()).toEqual(
      new Map([['1', { committed: 1, merged: 1, deleted: false }]]),
    )
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
    expect([...log.last().entries()]).toEqual([
      ['1', { committed: 1, merged: 1, deleted: false }],
      ['2', { committed: 2, merged: 2, deleted: false }],
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
    expect([...log.last().entries()]).toEqual([
      ['1', { committed: 1, merged: 1, deleted: false }],
      ['2', { committed: 2, merged: 2, deleted: false }],
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
  it('should ignore updates', () => {
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
    expect(log.last()).toEqual(new Map())
  })
})

describe('last', () => {
  it('returns empty log state', () => {
    const log = createLog([])
    expect(log.last()).toEqual(new Map())
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
    expect(log.last()).toEqual(
      new Map([['1', { committed: 1, merged: 1, deleted: false }]]),
    )
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
    expect(observer).toHaveBeenCalledWith(
      new Map([['1', { committed: 1, merged: 1, deleted: false }]]),
    )
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
