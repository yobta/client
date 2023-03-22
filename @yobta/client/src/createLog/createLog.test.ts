import {
  YobtaCollectionInsertOperation,
  YobtaCollectionMoveOperation,
  YobtaCollectionRevalidateOperation,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { createLogEntryFromOperation } from './createLogEntryFromOperation.js'
import { createLog } from './createLog.js'

type MockSnapshot = { id: string; key: string }

describe('factory', () => {
  it('returns a log object', () => {
    const log = createLog([])
    expect(log).toEqual({
      add: expect.any(Function),
      last: expect.any(Function),
      observe: expect.any(Function),
    })
  })
  it('receives initial state', () => {
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const log = createLog([insertOperaion])
    expect(log.last()).toEqual([createLogEntryFromOperation(insertOperaion)])
  })
  it('sorts initial operations', () => {
    const insertOperaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const insertOperaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    const log = createLog([insertOperaion2, insertOperaion1])
    expect(log.last()).toEqual([
      createLogEntryFromOperation(insertOperaion1),
      createLogEntryFromOperation(insertOperaion2),
    ])
  })
})

describe('add', () => {
  it('supports insert operations', () => {
    const log = createLog([])
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    log.add([insertOperaion])
    expect(log.last()).toEqual([createLogEntryFromOperation(insertOperaion)])
  })
  it('supports revalidate operations', () => {
    const log = createLog([])
    const operaion: YobtaCollectionRevalidateOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_REVALIDATE,
      data: [
        ['id', '1', 1, 1],
        ['key', 'value', 1, 1],
      ],
      channel: 'channel',
    }
    log.add([operaion])
    expect(log.last()).toEqual([createLogEntryFromOperation(operaion)])
  })
  it('supports reject operations', () => {
    const log = createLog([])
    const rejectOperaion: YobtaRejectOperation = {
      id: '1',
      committed: 1,
      merged: 1,
      operationId: '1',
      type: YOBTA_REJECT,
      channel: 'channel',
      reason: 'reason',
    }
    log.add([rejectOperaion])
    expect(log.last()).toEqual([createLogEntryFromOperation(rejectOperaion)])
  })
  it('supports move operations', () => {
    const log = createLog([])
    const insertOperaion: YobtaCollectionMoveOperation = {
      id: '1',
      committed: 1,
      merged: 1,
      type: YOBTA_COLLECTION_MOVE,
      channel: 'channel',
      snapshotId: '1',
      nextSnapshotId: '2',
    }
    log.add([insertOperaion])
    expect(log.last()).toEqual([createLogEntryFromOperation(insertOperaion)])
  })
  it('adds multiple entries', () => {
    const log = createLog([])
    const insertOperaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const insertOperaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    log.add([insertOperaion1, insertOperaion2])
    expect(log.last()).toEqual([
      createLogEntryFromOperation(insertOperaion1),
      createLogEntryFromOperation(insertOperaion2),
    ])
  })
  it('should mutate', () => {
    const log = createLog([])
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const last = log.last()
    log.add([insertOperaion])
    expect(last).toBe(log.last())
  })
  it('should sort entries by committed', () => {
    const log = createLog([])
    const insertOperaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const insertOperaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    log.add([insertOperaion2, insertOperaion1])
    expect(log.last()).toEqual([
      createLogEntryFromOperation(insertOperaion1),
      createLogEntryFromOperation(insertOperaion2),
    ])
  })
  it('should be idempotent', () => {
    const log = createLog([])
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    log.add([insertOperaion])
    log.add([insertOperaion])
    expect(log.last()).toEqual([
      [
        '1',
        'channel',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        '1',
        undefined,
        undefined,
      ],
    ])
  })
  it('throws if operation is not supported', () => {
    const log = createLog([])
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: 'unknown' as any,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    expect(() => {
      log.add([insertOperaion])
    }).toThrow()
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
    const insertOperaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const insertOperaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    const log = createLog([insertOperaion1, insertOperaion2])
    expect(log.last()).toEqual([
      createLogEntryFromOperation(insertOperaion1),
      createLogEntryFromOperation(insertOperaion2),
    ])
  })
})

describe('observe', () => {
  it('receives updates', () => {
    const log = createLog([])
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
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
    log.add([insertOperaion])
    expect(observer).toHaveBeenCalledWith([
      createLogEntryFromOperation(insertOperaion),
    ])
  })
  it('receives one update for multiple entries', () => {
    const log = createLog([])
    const insertOperaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const insertOperaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel: 'channel',
    }
    const observer = vi.fn()
    log.observe(observer)
    log.add([insertOperaion1, insertOperaion2])
    expect(observer).toHaveBeenCalledWith([
      createLogEntryFromOperation(insertOperaion1),
      createLogEntryFromOperation(insertOperaion2),
    ])
    expect(observer).toHaveBeenCalledTimes(1)
  })
  it('should not update when operation is already merged', () => {
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'channel',
    }
    const log = createLog([insertOperaion])
    const observer = vi.fn()
    log.observe(observer)
    log.add([insertOperaion])
    expect(observer).not.toHaveBeenCalled()
  })
})
