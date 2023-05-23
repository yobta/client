import {
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_INSERT,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_COLLECTION_CREATE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
  YobtaCollectionCreateOperation,
  YobtaChannelDeleteOperation,
  YobtaChannelInsertOperation,
} from '@yobta/protocol'
import { pause } from '@yobta/utils'

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

const chunkSize = 1024

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
    const op1: YobtaCollectionCreateOperation<MockItem> = {
      id: 'op-1',
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'value' },
      committed: 1,
      type: YOBTA_COLLECTION_CREATE,
      merged: 0,
    }
    const op2: YobtaChannelInsertOperation = {
      id: 'op-2',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'snapshot-id',
      committed: 1,
      merged: 0,
    }
    const op3: YobtaChannelDeleteOperation = {
      id: 'op-3',
      type: YOBTA_CHANNEL_DELETE,
      channel: 'channel',
      snapshotId: 'snapshot-id',
      committed: 1,
      merged: 0,
    }
    await log.merge('my-collection', op1)
    await log.merge('my-collection', op2)
    await log.merge('my-collection', op3)
    const stream = log.find('channel', 0, 1024)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'r-snapshot-id',
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
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
        },
        {
          id: 'op-3',
          channel: 'channel',
          type: YOBTA_CHANNEL_DELETE,
          snapshotId: 'snapshot-id',
          committed: 1,
          merged: expect.any(Number),
        },
      ],
    ])
  })
  it('respects minMerged argument', async () => {
    const log = createMemoryLog()
    const createOperation: YobtaCollectionCreateOperation<MockItem> = {
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'value' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_CREATE,
      merged: 0,
    }
    const insertOperation: YobtaChannelInsertOperation = {
      id: 'op-2',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'snapshot-id',
      committed: 1,
      merged: 0,
    }
    await log.merge('my-collection', createOperation)
    const { merged } = await log.merge('my-collection', insertOperation)
    const stream1 = log.find('channel', merged, 1024)
    const result1 = []
    for await (const item of stream1) {
      result1.push(item)
    }
    expect(result1).toEqual([])
    const stream2 = log.find('channel', merged + 1, 1024)
    const result2 = []
    for await (const item of stream2) {
      result2.push(item)
    }
    expect(result2).toEqual([])
    const stream3 = log.find('channel', merged - 1, 1024)
    const result3 = []
    for await (const item of stream3) {
      result3.push(item)
    }
    expect(result3).toEqual([expect.any(Object)])
  })
  it('supports: update, create, insert', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-3',
      type: YOBTA_COLLECTION_UPDATE,
      channel: 'update-insert-channel',
      data: {
        id: 'snapshot-id',
        one: 'three',
        two: 'two',
      },
      committed: 2,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_CREATE,
      channel: 'update-insert-channel',
      data: { id: 'snapshot-id', one: 'one' },
      committed: 1,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'update-insert-channel',
      snapshotId: 'snapshot-id',
      committed: 1,
      merged: 0,
    })
    const stream = log.find('update-insert-channel', 0, 1000)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'r-snapshot-id',
          type: YOBTA_COLLECTION_REVALIDATE,
          channel: 'update-insert-channel',
          snapshotId: 'snapshot-id',
          committed: 1,
          merged: expect.any(Number),
          data: [
            ['id', 'snapshot-id', 1, expect.any(Number)],
            ['one', 'three', 2, expect.any(Number)],
            ['two', 'two', 2, expect.any(Number)],
          ],
        },
        {
          id: 'op-2',
          type: 'yobta-channel-insert',
          channel: 'update-insert-channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
        },
      ],
    ])
  })
  it('supports: delete, create, insert', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-3',
      type: YOBTA_CHANNEL_DELETE,
      channel: 'channel',
      committed: 2,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_CREATE,
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'one' },
      committed: 1,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'snapshot-id',
      committed: 1,
      merged: 0,
    })
    const stream = log.find('channel', 0, 1024)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'r-snapshot-id',
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
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
        },
        {
          id: 'op-3',
          type: YOBTA_CHANNEL_DELETE,
          channel: 'channel',
          committed: 2,
          merged: expect.any(Number),
          snapshotId: 'snapshot-id',
        },
      ],
    ])
  })
  it('supports: create, insert, restore, delete', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_CREATE,
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'one' },
      committed: 1,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'snapshot-id',
      committed: 1,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-4',
      type: YOBTA_CHANNEL_RESTORE,
      channel: 'channel',
      committed: 3,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    await log.merge(collection, {
      id: 'op-3',
      type: YOBTA_CHANNEL_DELETE,
      channel: 'channel',
      committed: 2,
      merged: 0,
      snapshotId: 'snapshot-id',
    })
    const stream = log.find('channel', 0, 1024)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'r-snapshot-id',
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
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
        },
        {
          id: 'op-3',
          type: YOBTA_CHANNEL_DELETE,
          channel: 'channel',
          committed: 2,
          merged: expect.any(Number),
          snapshotId: 'snapshot-id',
        },
        {
          id: 'op-4',
          type: YOBTA_CHANNEL_RESTORE,
          channel: 'channel',
          committed: 3,
          merged: expect.any(Number),
          snapshotId: 'snapshot-id',
        },
      ],
    ])
  })
  it('supports: shift, delete, create, insert', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-3',
      type: YOBTA_CHANNEL_SHIFT,
      channel: 'channel',
      committed: 2,
      merged: 0,
      snapshotId: 'snapshot-id',
      nextSnapshotId: 'next-snapshot-id',
    })
    await log.merge(collection, {
      id: 'op-4',
      type: YOBTA_CHANNEL_DELETE,
      channel: 'channel',
      committed: 3,
      merged: 0,
      snapshotId: 'next-snapshot-id',
    })
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_CREATE,
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'one' },
      committed: 1,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'snapshot-id',
      committed: 1,
      merged: 0,
    })
    const stream = log.find('channel', 0, 1024)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'r-snapshot-id',
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
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'snapshot-id',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
        },
        {
          id: 'op-3',
          type: YOBTA_CHANNEL_SHIFT,
          channel: 'channel',
          committed: 2,
          merged: expect.any(Number),
          snapshotId: 'snapshot-id',
          nextSnapshotId: 'next-snapshot-id',
        },
        {
          id: 'op-4',
          type: YOBTA_CHANNEL_DELETE,
          channel: 'channel',
          committed: 3,
          merged: expect.any(Number),
          snapshotId: 'next-snapshot-id',
        },
      ],
    ])
  })
  it('supports create:a, create:b, insert:a, insert:a, insert:b>a, insert:a, delete:a, insert:a, insert:b>a', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_CREATE,
      channel: 'channel',
      data: { id: 'a' },
      committed: 1,
      merged: 0,
    })
    await pause(4)
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_COLLECTION_CREATE,
      channel: 'channel',
      data: { id: 'b' },
      committed: 2,
      merged: 0,
    })
    await pause(4)
    await log.merge(collection, {
      id: 'op-3',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'a',
      committed: 3,
      merged: 0,
    })
    await pause(4)
    await log.merge(collection, {
      id: 'op-4',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'a',
      committed: 4,
      merged: 0,
    })
    await pause(4)
    await log.merge(collection, {
      id: 'op-5',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'b',
      nextSnapshotId: 'a',
      committed: 5,
      merged: 0,
    })
    await pause(4)
    await log.merge(collection, {
      id: 'op-6',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'a',
      committed: 6,
      merged: 0,
    })
    await pause(4)
    await log.merge(collection, {
      id: 'op-7',
      type: YOBTA_CHANNEL_DELETE,
      channel: 'channel',
      snapshotId: 'a',
      committed: 7,
      merged: 0,
    })
    await pause(4)
    await log.merge(collection, {
      id: 'op-8',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'a',
      committed: 8,
      merged: 0,
    })
    await pause(4)
    await log.merge(collection, {
      id: 'op-9',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'b',
      nextSnapshotId: 'a',
      committed: 9,
      merged: 0,
    })
    const stream = log.find('channel', 0, 100000)
    const result = []
    for await (const chunk of stream) {
      result.push(chunk)
    }
    expect(result).toEqual([
      [
        {
          id: 'r-a',
          type: 'yobta-collection-revalidate',
          channel: 'channel',
          snapshotId: 'a',
          nextSnapshotId: undefined,
          committed: 3,
          merged: expect.any(Number),
          data: [['id', 'a', 1, expect.any(Number)]],
        },
        {
          id: 'op-3',
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'a',
          committed: 3,
          merged: expect.any(Number),
        },
        {
          id: 'op-4',
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'a',
          committed: 4,
          merged: expect.any(Number),
        },
        {
          id: 'r-b',
          type: 'yobta-collection-revalidate',
          channel: 'channel',
          snapshotId: 'b',
          committed: 5,
          merged: expect.any(Number),
          data: [['id', 'b', 2, expect.any(Number)]],
        },
        {
          id: 'op-5',
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'b',
          nextSnapshotId: 'a',
          committed: 5,
          merged: expect.any(Number),
        },
        {
          id: 'op-6',
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'a',
          committed: 6,
          merged: expect.any(Number),
        },
        {
          id: 'op-7',
          type: 'yobta-channel-delete',
          channel: 'channel',
          snapshotId: 'a',
          committed: 7,
          merged: expect.any(Number),
        },
        {
          id: 'op-8',
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'a',
          committed: 8,
          merged: expect.any(Number),
        },
        {
          id: 'op-9',
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'b',
          nextSnapshotId: 'a',
          committed: 9,
          merged: expect.any(Number),
        },
      ],
    ])
  })
  it('handles chunkSize correctly', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'op-1',
      type: YOBTA_COLLECTION_CREATE,
      channel: 'channel',
      data: { id: 'snapshot-id-1', one: 'one' },
      committed: 1,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-2',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'snapshot-id-1',
      committed: 1,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-3',
      type: YOBTA_COLLECTION_CREATE,
      channel: 'channel',
      data: { id: 'snapshot-id-2', one: 'two' },
      committed: 2,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-4',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'snapshot-id-2',
      committed: 2,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-5',
      type: YOBTA_COLLECTION_CREATE,
      channel: 'channel',
      data: { id: 'snapshot-id-3', one: 'three' },
      committed: 3,
      merged: 0,
    })
    await log.merge(collection, {
      id: 'op-6',
      type: YOBTA_CHANNEL_INSERT,
      channel: 'channel',
      snapshotId: 'snapshot-id-3',
      committed: 3,
      merged: 0,
    })
    const stream = log.find('channel', 0, 480)
    const result = []
    for await (const item of stream) {
      result.push(item)
    }
    expect(result).toEqual([
      [
        {
          id: 'r-snapshot-id-1',
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
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'snapshot-id-1',
          nextSnapshotId: undefined,
          committed: 1,
          merged: expect.any(Number),
        },
      ],
      [
        {
          id: 'r-snapshot-id-2',
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
        {
          id: 'op-4',
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'snapshot-id-2',
          nextSnapshotId: undefined,
          committed: 2,
          merged: expect.any(Number),
        },
      ],
      [
        {
          id: 'r-snapshot-id-3',
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
        {
          id: 'op-6',
          type: 'yobta-channel-insert',
          channel: 'channel',
          snapshotId: 'snapshot-id-3',
          nextSnapshotId: undefined,
          committed: 3,
          merged: expect.any(Number),
        },
      ],
    ])
  })
})

describe('log write', () => {
  it('returns create operation', async () => {
    const log = createMemoryLog()
    const insertOperation: YobtaCollectionCreateOperation<MockItem> = {
      channel: 'channel',
      data: { one: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_CREATE,
      merged: 0,
    }
    const collection = 'my-collection'
    const result = await log.merge(collection, insertOperation)
    expect(result).toEqual({
      channel: 'channel',
      data: { one: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_CREATE,
      merged: expect.any(Number),
    })
    expect(result.merged).toBeCloseTo(Date.now(), -10)
  })
  it('returns only merged keys for update', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      channel: 'channel',
      data: { one: 'one', id: 'snapshot-id' },
      committed: 2,
      id: 'operation-id',
      type: YOBTA_COLLECTION_CREATE,
      merged: 0,
    })
    const result = await log.merge(collection, {
      channel: 'channel',
      data: {
        id: 'snapshot-id',
        one: 'three',
        two: 'two',
      },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_UPDATE,
      merged: 0,
    })
    expect(result).toEqual({
      channel: 'channel',
      data: { two: 'two' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_UPDATE,
      merged: expect.any(Number),
    })
  })
  it('returns revalidate operation when there is an insert conflict', async () => {
    const log = createMemoryLog()
    const collection = 'my-collection'
    await log.merge(collection, {
      id: 'operation-1',
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'one' },
      committed: 2,
      type: YOBTA_COLLECTION_CREATE,
      merged: 0,
    })
    const result = await log.merge(collection, {
      id: 'operation-2',
      channel: 'channel',
      data: { id: 'snapshot-id', one: 'one1' },
      committed: 3,
      type: YOBTA_COLLECTION_CREATE,
      merged: 0,
    })
    expect(result).toEqual({
      id: 'r-snapshot-id',
      channel: 'channel',
      data: [
        ['id', 'snapshot-id', 2, expect.any(Number)],
        ['one', 'one', 2, expect.any(Number)],
      ],
      committed: 2,
      type: YOBTA_COLLECTION_REVALIDATE,
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
        data: {
          id: 'snapshot-id',
          one: 'three',
          two: 'two',
        },
        committed: 1,
        id: 'operation-id',
        type: 'invalid-operation-type' as typeof YOBTA_COLLECTION_UPDATE,
        merged: 0,
      }),
    ).rejects.toThrow('Invalid operation')
  })
})
