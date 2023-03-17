import {
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { createMemoryLog } from './createMemoryLog.js'

type MockItem = {
  id: string
  one: string
  two?: string
}

describe('log factory', () => {
  it('returns a log', () => {
    const log = createMemoryLog()
    expect(log).toEqual({
      find: expect.any(Function),
      merge: expect.any(Function),
      observe: expect.any(Function),
    })
  })
})

describe('log read', () => {
  it('reads an empty log', async () => {
    const log = createMemoryLog()
    const result = await log.find('channel', 0)
    expect(result).toEqual([])
  })
  it('returns matching items', async () => {
    const log = createMemoryLog()
    const insertOperation: YobtaCollectionInsertOperation<MockItem> = {
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'value' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      snapshotId: 'snapshot-id',
    }
    await log.merge('my-collection', insertOperation)
    const result = await log.find('channel', 0)
    expect(result).toEqual([
      {
        id: expect.any(String),
        channel: 'channel',
        data: [
          ['id', 'snapshot-id', 1, expect.any(Number)],
          ['one', 'value', 1, expect.any(Number)],
        ],
        committed: 1,
        type: YOBTA_COLLECTION_REVALIDATE,
        merged: expect.any(Number),
        snapshotId: 'snapshot-id',
      },
    ])
  })
  it('respects minMerged argument', async () => {
    const log = createMemoryLog()
    const insertOperation: YobtaCollectionInsertOperation<MockItem> = {
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'value' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      snapshotId: 'snapshot-id',
    }
    const { merged } = await log.merge('my-collection', insertOperation)
    const result1 = await log.find('channel', merged)
    expect(result1).toEqual([])

    const result2 = await log.find('channel', merged + 1)
    expect(result2).toEqual([])

    const result3 = await log.find('channel', merged - 1)
    expect(result3).toEqual([expect.any(Object)])
  })
})

describe('log write', () => {
  it('returns merged operation', async () => {
    const log = createMemoryLog()
    const insertOperation: YobtaCollectionInsertOperation<MockItem> = {
      channel: 'channel',
      data: { one: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      snapshotId: 'snapshot-id',
    }
    const collection = 'my-collection'
    const result = await log.merge(collection, insertOperation)
    expect(result).toEqual({
      channel: 'channel',
      data: { one: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: expect.any(Number),
      snapshotId: 'snapshot-id',
    })
    expect(result.merged).toBeCloseTo(Date.now(), -10)
  })
  it('returns only merged keys', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      channel: 'channel',
      data: { one: 'one', id: 'snapshot-id' },
      committed: 2,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    const result = await log.merge(collection, {
      channel: 'channel',
      data: { one: 'three', two: 'two' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_UPDATE,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    expect(result).toEqual({
      channel: 'channel',
      data: { two: 'two' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_UPDATE,
      merged: expect.any(Number),
      snapshotId: 'snapshot-id',
    })
  })
})
