import {
  YobtaCollectionInsertOperation,
  YobtaCollectionMoveOperation,
  YobtaCollectionRevalidateOperation,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_REJECT,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'
import { connectLogger } from '@yobta/utils'

import { createClientLog } from './createClientLog.js'
import { clientLogger } from '../clientLogger/clientLogger.js'

type MockSnapshot = { id: string; key: string }

const channel = 'test-channel'

describe('factory', () => {
  it('returns a log object', () => {
    const log = createClientLog(channel)
    expect(log).toEqual({
      add: expect.any(Function),
      last: expect.any(Function),
      observe: expect.any(Function),
    })
  })
})

describe('add', () => {
  it('supports insert operations', () => {
    const log = createClientLog(channel)
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel,
    }
    log.add([insertOperaion])
    expect(log.last()).toEqual([insertOperaion])
  })
  it('supports update operations', () => {
    const log = createClientLog(channel)
    const operaion: YobtaCollectionUpdateOperation<MockSnapshot> = {
      id: 'op-1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_UPDATE,
      data: { key: 'value 2' },
      channel,
    }
    log.add([operaion])
    expect(log.last()).toEqual([operaion])
  })
  it('supports revalidate operations', () => {
    const log = createClientLog(channel)
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
      channel,
    }
    log.add([operaion])
    expect(log.last()).toEqual([operaion])
  })
  it('supports reject operations', () => {
    const log = createClientLog(channel)
    const rejectOperaion: YobtaRejectOperation = {
      id: '1',
      committed: 1,
      merged: 1,
      operationId: '1',
      type: YOBTA_REJECT,
      channel,
      reason: 'reason',
    }
    log.add([rejectOperaion])
    expect(log.last()).toEqual([rejectOperaion])
  })
  it('supports move operations', () => {
    const log = createClientLog(channel)
    const insertOperaion: YobtaCollectionMoveOperation = {
      id: '1',
      committed: 1,
      merged: 1,
      type: YOBTA_COLLECTION_MOVE,
      channel,
      snapshotId: '1',
      nextSnapshotId: '2',
    }
    log.add([insertOperaion])
    expect(log.last()).toEqual([insertOperaion])
  })
  it('adds multiple entries', () => {
    const log = createClientLog(channel)
    const insertOperaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel,
    }
    const insertOperaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel,
    }
    log.add([insertOperaion1, insertOperaion2])
    expect(log.last()).toEqual([insertOperaion1, insertOperaion2])
  })
  it('should mutate', () => {
    const log = createClientLog(channel)
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel,
    }
    const last = log.last()
    log.add([insertOperaion])
    expect(last).toBe(log.last())
  })
  it('sorts by committed', () => {
    const log = createClientLog(channel)
    const insertOperaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 2,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel,
    }
    const insertOperaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 1,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel,
    }
    log.add([insertOperaion2, insertOperaion1])
    expect(log.last()).toEqual([insertOperaion1, insertOperaion2])
  })
  it('should be idempotent', () => {
    const log = createClientLog(channel)
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel,
    }
    log.add([insertOperaion])
    log.add([insertOperaion])
    expect(log.last()).toEqual([insertOperaion])
  })
  it('throws if operation is not supported', () => {
    const log = createClientLog(channel)
    const mockLogger = {
      error: vi.fn(),
    }
    const unsubscribeLogger = connectLogger(clientLogger, mockLogger)
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: 'unknown' as any,
      data: { id: '1', key: 'value' },
      channel,
    }
    log.add([insertOperaion])
    expect(mockLogger.error).toHaveBeenCalledOnce()
    unsubscribeLogger()
  })
  it('ignores operations with unknown channel', () => {
    const log = createClientLog(channel)
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'unknown',
    }
    log.add([insertOperaion])
    expect(log.last()).toEqual([])
  })
  it('does not ignore operations with unknown channel if the scope is not set', () => {
    const log = createClientLog()
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel: 'unknown',
    }
    log.add([insertOperaion])
    expect(log.last()).toEqual([insertOperaion])
  })
})

describe('last', () => {
  it('returns empty log state', () => {
    const log = createClientLog(channel)
    expect(log.last()).toEqual([])
  })
  it('returns empty array if log is empty', () => {
    const log = createClientLog(channel)
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
      channel,
    }
    const insertOperaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel,
    }
    const log = createClientLog(channel)
    log.add([insertOperaion1, insertOperaion2])
    expect(log.last()).toEqual([insertOperaion1, insertOperaion2])
  })
})

describe('observe', () => {
  it('receives updates', () => {
    const log = createClientLog(channel)
    const insertOperaion: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel,
    }
    const observer = vi.fn()
    log.observe(observer)
    log.add([insertOperaion])
    expect(observer).toHaveBeenCalledWith([insertOperaion])
  })
  it('receives one update for multiple entries', () => {
    const log = createClientLog(channel)
    const insertOperaion1: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '1',
      committed: 1,
      merged: 1,
      snapshotId: '1',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '1', key: 'value' },
      channel,
    }
    const insertOperaion2: YobtaCollectionInsertOperation<MockSnapshot> = {
      id: '2',
      committed: 2,
      merged: 2,
      snapshotId: '2',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: '2', key: 'value' },
      channel,
    }
    const observer = vi.fn()
    log.observe(observer)
    log.add([insertOperaion1, insertOperaion2])
    expect(observer).toHaveBeenCalledWith([insertOperaion1, insertOperaion2])
    expect(observer).toHaveBeenCalledTimes(1)
  })
})
