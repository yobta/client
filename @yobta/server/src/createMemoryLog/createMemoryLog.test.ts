import {
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import locals, { createMemoryLog } from './createMemoryLog.js'

const { mergeOperation } = locals

type MockItem = {
  id: string
  key: string
}

describe('log factory', () => {
  it('returns a log', () => {
    const log = createMemoryLog()
    expect(log).toEqual({
      find: expect.any(Function),
      merge: expect.any(Function),
    })
  })
})

describe('log read', () => {
  it('reads an empty log', async () => {
    const log = createMemoryLog()
    const result = await log.find('channel', 0)
    expect(result).toEqual([])
  })
})

describe('log write', () => {
  it('writes to a log', async () => {
    const log = createMemoryLog()
    const insertOperation: YobtaCollectionInsertOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      ref: 'snapshot-id',
    }
    const result = await log.merge([insertOperation])
    const entry1 = {
      key: 'key',
      value: 'value',
      channel: 'channel',
      committed: 1,
      merged: expect.any(Number),
      operationId: 'operation-id',
    }
    const entry2 = {
      key: 'id',
      value: 'snapshot-id',
      channel: 'channel',
      committed: 1,
      merged: expect.any(Number),
      operationId: 'operation-id',
    }
    expect(result).toEqual([[entry1, entry2]])
    expect(result[0][0].merged).toBeGreaterThan(0)
    expect(result[0][1].merged).toBeGreaterThan(0)
    expect(result[0][0].merged).toBeLessThanOrEqual(result[0][1].merged)

    const snapshot = await log.find('channel', 0)
    expect(snapshot).toEqual([entry1, entry2])
  })
})

describe('mergeOperation', () => {
  it('should merge insert operation', () => {
    const log = new Map()
    const insertOperation: YobtaCollectionInsertOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      ref: 'snapshot-id',
    }
    const item = mergeOperation(log, insertOperation)
    expect(item).toEqual([
      {
        channel: 'channel',
        committed: 1,
        merged: expect.any(Number),
        key: 'key',
        value: 'value',
        operationId: 'operation-id',
      },
      {
        channel: 'channel',
        committed: 1,
        merged: expect.any(Number),
        key: 'id',
        value: 'snapshot-id',
        operationId: 'operation-id',
      },
    ])
    expect(log).toEqual(
      new Map([
        ['channel.snapshot-id.key', item[0]],
        ['channel.snapshot-id.id', item[1]],
      ]),
    )
  })
  it('should merge update operation', () => {
    const log = new Map()
    const updateOperation: YobtaCollectionUpdateOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'value' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_UPDATE,
      merged: 0,
      ref: 'snapshot-id',
    }
    const item = mergeOperation(log, updateOperation)
    expect(item).toEqual([
      {
        channel: 'channel',
        committed: 1,
        merged: expect.any(Number),
        key: 'key',
        value: 'value',
        operationId: 'operation-id',
      },
    ])
    expect(log).toEqual(new Map([['channel.snapshot-id.key', item[0]]]))
  })
  it('should merge insert and update operations', () => {
    const log = new Map()
    const insertOperation: YobtaCollectionInsertOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      ref: 'snapshot-id',
    }
    const updateOperation: YobtaCollectionUpdateOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'updated value' },
      committed: 2,
      id: 'operation-id',
      type: YOBTA_COLLECTION_UPDATE,
      merged: 0,
      ref: 'snapshot-id',
    }
    mergeOperation(log, insertOperation)
    mergeOperation(log, updateOperation)
    expect(log).toEqual(
      new Map([
        [
          'channel.snapshot-id.key',
          {
            channel: 'channel',
            committed: 2,
            merged: expect.any(Number),
            key: 'key',
            value: 'updated value',
            operationId: 'operation-id',
          },
        ],
        [
          'channel.snapshot-id.id',
          {
            channel: 'channel',
            committed: 1,
            merged: expect.any(Number),
            key: 'id',
            value: 'snapshot-id',
            operationId: 'operation-id',
          },
        ],
      ]),
    )
  })
  it('should merge update and insert operations', () => {
    const log = new Map()
    const insertOperation: YobtaCollectionInsertOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      ref: 'snapshot-id',
    }
    const updateOperation: YobtaCollectionUpdateOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'updated value' },
      committed: 2,
      id: 'operation-id',
      type: YOBTA_COLLECTION_UPDATE,
      merged: 0,
      ref: 'snapshot-id',
    }
    mergeOperation(log, updateOperation)
    mergeOperation(log, insertOperation)
    expect(log).toEqual(
      new Map([
        [
          'channel.snapshot-id.key',
          {
            channel: 'channel',
            committed: 2,
            merged: expect.any(Number),
            key: 'key',
            value: 'updated value',
            operationId: 'operation-id',
          },
        ],
        [
          'channel.snapshot-id.id',
          {
            channel: 'channel',
            committed: 1,
            merged: expect.any(Number),
            key: 'id',
            value: 'snapshot-id',
            operationId: 'operation-id',
          },
        ],
      ]),
    )
  })
  it('is idimpotent', () => {
    const log1 = new Map()
    const log2 = new Map()
    const insertOperation: YobtaCollectionInsertOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      ref: 'snapshot-id',
    }
    const updateOperation: YobtaCollectionUpdateOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'updated value' },
      committed: 2,
      id: 'operation-id',
      type: YOBTA_COLLECTION_UPDATE,
      merged: 0,
      ref: 'snapshot-id',
    }
    mergeOperation(log1, insertOperation)
    mergeOperation(log1, updateOperation)
    mergeOperation(log1, insertOperation)

    mergeOperation(log2, updateOperation)
    mergeOperation(log2, updateOperation)
    mergeOperation(log2, insertOperation)
    mergeOperation(log2, insertOperation)
    mergeOperation(log2, updateOperation)

    expect(log1).toEqual(log2)
  })
  it('wins when committed later', () => {
    const log = new Map()
    const insertOperation: YobtaCollectionInsertOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'value', id: 'snapshot-id' },
      committed: 1,
      id: 'operation-id',
      type: YOBTA_COLLECTION_INSERT,
      merged: 0,
      ref: 'snapshot-id',
    }
    const updateOperation1: YobtaCollectionUpdateOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'updated value' },
      committed: 2,
      id: 'operation-id-1',
      type: YOBTA_COLLECTION_UPDATE,
      merged: 0,
      ref: 'snapshot-id',
    }
    const updateOperation2: YobtaCollectionUpdateOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'updated value 2' },
      committed: 3,
      id: 'operation-id-3',
      type: YOBTA_COLLECTION_UPDATE,
      merged: 0,
      ref: 'snapshot-id',
    }
    mergeOperation(log, insertOperation)
    mergeOperation(log, updateOperation2)
    mergeOperation(log, updateOperation1)
    expect(log.get('channel.snapshot-id.key')).toEqual({
      channel: 'channel',
      committed: 3,
      merged: expect.any(Number),
      key: 'key',
      value: 'updated value 2',
      operationId: 'operation-id-3',
    })
  })
  it('should not mutate entry', () => {
    const entry1 = {
      channel: 'channel',
      committed: 1,
      merged: 2,
      key: 'key',
      value: 'value',
      operationId: 'operation-id',
    }
    const updateOperation: YobtaCollectionUpdateOperation<MockItem> = {
      channel: 'channel',
      data: { key: 'value' },
      committed: 3,
      id: 'operation-id',
      type: YOBTA_COLLECTION_UPDATE,
      merged: 0,
      ref: 'snapshot-id',
    }
    const log = new Map([['channel.key', entry1]])
    const item = mergeOperation(log, updateOperation)
    expect(item).toEqual([
      { ...entry1, committed: 3, merged: expect.any(Number) },
    ])
    expect(log.get('channel.snapshot-id.key')).not.toBe(entry1)
  })
})
