import {
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
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

const chunkSize = 20

describe('log read', () => {
  it('reads an empty log', async () => {
    const log = createMemoryLog()
    const stream = log.find('channel', 0, chunkSize)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([])
  })
  it('returns matching items', async () => {
    const log = createMemoryLog()
    await log.merge('my-collection', {
      id: 'op-1',
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'value' },
      committed: 1,
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    await log.merge('my-collection', {
      id: 'op-2',
      type: YOBTA_COLLECTION_DELETE,
      channel: 'channel',
      snapshotId: 'snapshot-id',
      committed: 1,
      merged: 0,
    })
    const stream = log.find('channel', 0, 10)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect
    expect(result).toEqual([
      [
        {
          id: 'op-1',
          type: YOBTA_COLLECTION_REVALIDATE,
          channel: 'channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
          data: [
            ['id', 'snapshot-id', 1, expect.any(Number)],
            ['one', 'value', 1, expect.any(Number)],
          ],
        },
        {
          id: 'op-2',
          channel: 'channel',
          type: YOBTA_COLLECTION_DELETE,
          snapshotId: 'snapshot-id',
          committed: 1,
          merged: expect.any(Number),
        },
      ],
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

    const stream1 = log.find('channel', merged, 10)
    const result1 = []
    for await (const item of stream1) {
      result1.push(item)
    }
    expect(result1).toEqual([])

    const stream2 = log.find('channel', merged + 1, 10)
    const result2 = []
    for await (const item of stream2) {
      result2.push(item)
    }
    expect(result2).toEqual([])

    const stream3 = log.find('channel', merged - 1, 10)
    const result3 = []
    for await (const item of stream3) {
      result3.push(item)
    }
    expect(result3).toEqual([expect.any(Object)])
  })
  it('supports: update then insert', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_COLLECTION_UPDATE,
      channel: 'channel',
      data: { one: 'three', two: 'two' },
      committed: 2,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    await log.merge(collection, {
      type: YOBTA_COLLECTION_INSERT,
      channel: 'channel',
      data: { one: 'one', id: 'snapshot-id' },
      committed: 1,
      id: 'op-1',
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    const stream = log.find('channel', 0, 10)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'op-1',
          type: YOBTA_COLLECTION_REVALIDATE,
          channel: 'channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
          data: [
            ['id', 'snapshot-id', 1, expect.any(Number)],
            ['one', 'three', 2, expect.any(Number)],
            ['two', 'two', 2, expect.any(Number)],
          ],
        },
      ],
    ])
  })
  it('supports: delete then insert', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_COLLECTION_DELETE,
      channel: 'channel',
      committed: 2,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'one' },
      committed: 1,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    const stream = log.find('channel', 0, 10)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'op-1',
          type: YOBTA_COLLECTION_REVALIDATE,
          channel: 'channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
          data: [
            ['id', 'snapshot-id', 1, expect.any(Number)],
            ['one', 'one', 1, expect.any(Number)],
          ],
        },
        {
          id: 'op-2',
          type: YOBTA_COLLECTION_DELETE,
          channel: 'channel',
          committed: 2,
          merged: expect.any(Number),
          snapshotId: 'snapshot-id',
        },
      ],
    ])
  })
  it('supports: insert, restore, delete', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'one' },
      committed: 1,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    await log.merge(collection, {
      id: 'op-3',
      type: YOBTA_COLLECTION_RESTORE,
      channel: 'channel',
      committed: 3,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_COLLECTION_DELETE,
      channel: 'channel',
      committed: 2,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    const stream = log.find('channel', 0, 10)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'op-1',
          type: YOBTA_COLLECTION_REVALIDATE,
          channel: 'channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
          data: [
            ['id', 'snapshot-id', 1, expect.any(Number)],
            ['one', 'one', 1, expect.any(Number)],
          ],
        },
        {
          id: 'op-2',
          type: YOBTA_COLLECTION_DELETE,
          channel: 'channel',
          committed: 2,
          merged: expect.any(Number),
          snapshotId: 'snapshot-id',
        },
        {
          id: 'op-3',
          type: YOBTA_COLLECTION_RESTORE,
          channel: 'channel',
          committed: 3,
          merged: expect.any(Number),
          snapshotId: 'snapshot-id',
        },
      ],
    ])
  })
  it('supports: move, delete, insert', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_COLLECTION_MOVE,
      channel: 'channel',
      committed: 2,
      merged: 0,
      snapshotId: 'snapshot-id',
      nextSnapshotId: 'next-snapshot-id',
    })
    await log.merge(collection, {
      id: 'op-3',
      type: YOBTA_COLLECTION_DELETE,
      channel: 'channel',
      committed: 3,
      merged: 0,
      snapshotId: 'next-snapshot-id',
    })
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'one' },
      committed: 1,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    const stream = log.find('channel', 0, 10)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'op-1',
          type: YOBTA_COLLECTION_REVALIDATE,
          channel: 'channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
          data: [
            ['id', 'snapshot-id', 1, expect.any(Number)],
            ['one', 'one', 1, expect.any(Number)],
          ],
        },
        {
          id: 'op-2',
          type: YOBTA_COLLECTION_MOVE,
          channel: 'channel',
          committed: 2,
          merged: expect.any(Number),
          snapshotId: 'snapshot-id',
          nextSnapshotId: 'next-snapshot-id',
        },
        {
          id: 'op-3',
          type: YOBTA_COLLECTION_DELETE,
          channel: 'channel',
          committed: 3,
          merged: expect.any(Number),
          snapshotId: 'next-snapshot-id',
        },
      ],
    ])
  })
  it('handles chunkSize correctly', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'channel',
      data: { id: 'snapshot-id-1', one: 'one' },
      committed: 1,
      merged: 0,
      snapshotId: 'snapshot-id-1',
    })
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'channel',
      data: { id: 'snapshot-id-2', one: 'two' },
      committed: 2,
      merged: 0,
      snapshotId: 'snapshot-id-2',
    })
    await log.merge(collection, {
      id: 'op-3',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'channel',
      data: { id: 'snapshot-id-3', one: 'three' },
      committed: 3,
      merged: 0,
      snapshotId: 'snapshot-id-3',
    })
    const stream = log.find('channel', 0, 2)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'op-1',
          type: YOBTA_COLLECTION_REVALIDATE,
          channel: 'channel',
          snapshotId: 'snapshot-id-1',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
          data: [
            ['id', 'snapshot-id-1', 1, expect.any(Number)],
            ['one', 'one', 1, expect.any(Number)],
          ],
        },
        {
          id: 'op-2',
          type: YOBTA_COLLECTION_REVALIDATE,
          channel: 'channel',
          snapshotId: 'snapshot-id-2',
          nextSnapshotId: undefined,
          committed: 2,
          merged: expect.any(Number),
          data: [
            ['id', 'snapshot-id-2', 2, expect.any(Number)],
            ['one', 'two', 2, expect.any(Number)],
          ],
        },
      ],
      [
        {
          id: 'op-3',
          type: YOBTA_COLLECTION_REVALIDATE,
          channel: 'channel',
          snapshotId: 'snapshot-id-3',
          nextSnapshotId: undefined,
          committed: 3,
          merged: expect.any(Number),
          data: [
            ['id', 'snapshot-id-3', 3, expect.any(Number)],
            ['one', 'three', 3, expect.any(Number)],
          ],
        },
      ],
    ])
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
  it('throws when gets invalid operation', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await expect(
      log.merge(collection, {
        channel: 'channel',
        data: { one: 'three', two: 'two' },
        committed: 1,
        id: 'operation-id',
        type: 'invalid-operation-type' as typeof YOBTA_COLLECTION_UPDATE,
        merged: 0,
        snapshotId: 'snapshot-id',
      }),
    ).rejects.toThrow('Invalid operation')
  })
})
