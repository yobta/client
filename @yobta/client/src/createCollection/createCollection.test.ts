import {
  YobtaCollectionUpdateOperation,
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_COLLECTION_REVALIDATE,
} from '@yobta/protocol'

import { createCollection } from './createCollection.js'
import { queueOperation } from '../queue/queue.js'
import { createMemoryStore } from '../createMemoryStore/createMemoryStore.js'

type Snapshot = {
  id: string
  name: string
}

vi.mock('../queue/queue.js', () => ({
  queueOperation: vi.fn(),
}))

const store = createMemoryStore<Snapshot>('test')

afterEach(() => {
  store.clear()
})

describe('factory', () => {
  it('returns a collection object', () => {
    const collection = createCollection(store)
    expect(collection).toEqual({
      commit: expect.any(Function),
      get: expect.any(Function),
      last: expect.any(Function),
      merge: expect.any(Function),
      observe: expect.any(Function),
      on: expect.any(Function),
      store: {
        fetch: expect.any(Function),
        put: expect.any(Function),
        clear: expect.any(Function),
      },
    })
  })
})
describe('merge', () => {
  it('resolves insert:a', () => {
    const collection = createCollection(store)
    collection.merge([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'test',
        data: { id: 'item-1', name: 'test' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
    ])
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test' })
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1', name: 'test' },
      { id: 1, name: 1 },
    ])
    expect(collection.last()).toEqual(mockState)
  })
  it('resolves insert:a, insert:b', () => {
    const collection = createCollection(store)
    collection.merge([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'test',
        data: { id: 'item-1', name: 'test' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
      {
        id: 'op-2',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'test',
        data: { id: 'item-2', name: 'test' },
        snapshotId: 'item-2',
        committed: 2,
        merged: 2,
      },
    ])
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1', name: 'test' },
      { id: 1, name: 1 },
    ])
    mockState.set('item-2', [
      { id: 'item-2', name: 'test' },
      { id: 2, name: 2 },
    ])
    expect(collection.last()).toEqual(mockState)
  })
  it('resolves update:a', () => {
    const collection = createCollection(store)
    collection.merge([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'test',
        data: { name: 'test 2' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
    ])
    expect(collection.get('item-1')).toBeUndefined()
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1', name: 'test 2' },
      { id: 0, name: 1 },
    ])
    expect(collection.last()).toEqual(mockState)
  })
  it('resolves update:a, update:a', () => {
    const collection = createCollection(store)
    collection.merge([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'test',
        data: { name: 'test 2' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
      {
        id: 'op-2',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'test',
        data: { name: 'test 3' },
        snapshotId: 'item-1',
        committed: 2,
        merged: 2,
      },
    ])
    expect(collection.get('item-1')).toBeUndefined()
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1', name: 'test 3' },
      { id: 0, name: 2 },
    ])
    expect(collection.last()).toEqual(mockState)
  })
  it('resolves insert:a, update:a', () => {
    const collection = createCollection(store)
    collection.merge([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'test',
        data: { id: 'item-1', name: 'test' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
      {
        id: 'op-2',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'test',
        data: { name: 'test 2' },
        snapshotId: 'item-1',
        committed: 2,
        merged: 2,
      },
    ])
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test 2' })
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1', name: 'test 2' },
      { id: 1, name: 2 },
    ])
    expect(collection.last()).toEqual(mockState)
  })
  it('resolves update:a, insert:a', () => {
    const collection = createCollection(store)
    collection.merge([
      {
        id: 'op-2',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'test',
        data: { name: 'test 2' },
        snapshotId: 'item-1',
        committed: 2,
        merged: 2,
      },
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'test',
        data: { id: 'item-1', name: 'test' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
    ])
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test 2' })
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1', name: 'test 2' },
      { id: 1, name: 2 },
    ])
    expect(collection.last()).toEqual(mockState)
  })
  it('resolves revalidate:a', () => {
    const collection = createCollection(store)
    collection.merge([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_REVALIDATE,
        channel: 'test',
        data: [
          ['id', 'item-1', 1, 1],
          ['name', 'john', 1, 1],
        ],
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
    ])
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'john' })
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1', name: 'john' },
      { id: 1, name: 1 },
    ])
    expect(collection.last()).toEqual(mockState)
  })
  //todo: unsupportable
  it('is idempotent', () => {
    const collection = createCollection(store)
    collection.merge([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'test',
        data: { id: 'item-1', name: 'test' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
      {
        id: 'op-2',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'test',
        data: { name: 'test 2' },
        snapshotId: 'item-1',
        committed: 2,
        merged: 2,
      },
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'test',
        data: { id: 'item-1', name: 'test' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
    ])
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test 2' })
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1', name: 'test 2' },
      { id: 1, name: 2 },
    ])
    expect(collection.last()).toEqual(mockState)
  })
  it('is immutable', () => {
    const collection = createCollection(store)
    const state = collection.last()
    collection.merge([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'test',
        data: { id: 'item-1', name: 'test' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
    ])
    expect(collection.last()).not.toBe(state)
  })
  it('sould remove pending operations', () => {
    const collection = createCollection(store)
    collection.commit({
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'test',
      data: { id: 'item-1', name: 'test' },
      snapshotId: 'item-1',
      committed: 1,
      merged: 1,
    })
    collection.merge([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'test',
        data: { id: 'item-1', name: 'test' },
        snapshotId: 'item-1',
        committed: 1,
        merged: 1,
      },
    ])
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1', name: 'test' },
      { id: 1, name: 1 },
    ])
    expect(collection.last()).toEqual(mockState)
  })
})
describe('commit', () => {
  it('should commit insert operation', () => {
    const collection = createCollection(store)
    const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'test',
      data: { id: 'item-1', name: 'test' },
      snapshotId: 'item-1',
      committed: 1,
      merged: 1,
    }
    collection.commit(insertOperation)
    const mockState = new Map()
    mockState.set('item-1', [{ id: 'item-1' }, { id: 0 }, insertOperation])
    expect(collection.last()).toEqual(mockState)
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test' })
    expect(queueOperation).toHaveBeenCalledTimes(1)
    expect(queueOperation).toHaveBeenCalledWith(insertOperation)
  })
  it('should commit update operation', () => {
    const collection = createCollection(store)
    const updateOperation: YobtaCollectionUpdateOperation<Snapshot> = {
      id: 'op-2',
      type: YOBTA_COLLECTION_UPDATE,
      channel: 'test',
      data: { name: 'test 2' },
      snapshotId: 'item-1',
      committed: 2,
      merged: 2,
    }
    collection.commit(updateOperation)
    const mockState = new Map()
    mockState.set('item-1', [{ id: 'item-1' }, { id: 0 }, updateOperation])
    expect(collection.last()).toEqual(mockState)
    expect(collection.get('item-1')).toBeUndefined()
    expect(queueOperation).toHaveBeenCalledTimes(1)
    expect(queueOperation).toHaveBeenCalledWith(updateOperation)
  })
  it('resolves insert, update', () => {
    const collection = createCollection(store)
    const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'test',
      data: { id: 'item-1', name: 'test' },
      snapshotId: 'item-1',
      committed: 1,
      merged: 1,
    }
    const updateOperation: YobtaCollectionUpdateOperation<Snapshot> = {
      id: 'op-2',
      type: YOBTA_COLLECTION_UPDATE,
      channel: 'test',
      data: { name: 'test 2' },
      snapshotId: 'item-1',
      committed: 2,
      merged: 2,
    }
    collection.commit(insertOperation)
    collection.commit(updateOperation)
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1' },
      { id: 0 },
      insertOperation,
      updateOperation,
    ])
    expect(collection.last()).toEqual(mockState)
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test 2' })
  })
  it('resolves update, insert', () => {
    const collection = createCollection(store)
    const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'test',
      data: { id: 'item-1', name: 'test' },
      snapshotId: 'item-1',
      committed: 1,
      merged: 1,
    }
    const updateOperation: YobtaCollectionUpdateOperation<Snapshot> = {
      id: 'op-2',
      type: YOBTA_COLLECTION_UPDATE,
      channel: 'test',
      data: { name: 'test 2' },
      snapshotId: 'item-1',
      committed: 2,
      merged: 2,
    }
    collection.commit(updateOperation)
    collection.commit(insertOperation)
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1' },
      { id: 0 },
      updateOperation,
      insertOperation,
    ])
    expect(collection.last()).toEqual(mockState)
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test 2' })
  })
  it('should be idempotent', () => {
    const collection = createCollection(store)
    const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'test',
      data: { id: 'item-1', name: 'test' },
      snapshotId: 'item-1',
      committed: 1,
      merged: 1,
    }
    const updateOperation: YobtaCollectionUpdateOperation<Snapshot> = {
      id: 'op-2',
      type: YOBTA_COLLECTION_UPDATE,
      channel: 'test',
      data: { name: 'test 2' },
      snapshotId: 'item-1',
      committed: 2,
      merged: 2,
    }
    collection.commit(insertOperation)
    collection.commit(updateOperation)
    collection.commit(insertOperation)
    collection.commit(updateOperation)
    const mockState = new Map()
    mockState.set('item-1', [
      { id: 'item-1' },
      { id: 0 },
      insertOperation,
      updateOperation,
    ])
    expect(collection.last()).toEqual(mockState)
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test 2' })
  })
  it('should not mutate state', () => {
    const collection = createCollection(store)
    const state = collection.last()
    const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'test',
      data: { id: 'item-1', name: 'test' },
      snapshotId: 'item-1',
      committed: 1,
      merged: 1,
    }
    collection.commit(insertOperation)
    expect(collection.last()).not.toBe(state)
  })
})
describe('get', () => {
  it('should return undefined if no item with given id', () => {
    const collection = createCollection(store)
    expect(collection.get('item-1')).toBeUndefined()
  })
  it('should return item if it exists', () => {
    const collection = createCollection(store)
    const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'test',
      data: { id: 'item-1', name: 'test' },
      snapshotId: 'item-1',
      committed: 1,
      merged: 1,
    }
    collection.commit(insertOperation)
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test' })
  })
  it('should return undefined if update was merged ahead of insert', () => {
    const collection = createCollection(store)
    const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'test',
      data: { id: 'item-1', name: 'test' },
      snapshotId: 'item-1',
      committed: 1,
      merged: 1,
    }
    const updateOperation: YobtaCollectionUpdateOperation<Snapshot> = {
      id: 'op-2',
      type: YOBTA_COLLECTION_UPDATE,
      channel: 'test',
      data: { name: 'test 2' },
      snapshotId: 'item-1',
      committed: 2,
      merged: 2,
    }
    collection.commit(updateOperation)
    expect(collection.get('item-1')).toBeUndefined()
    collection.commit(insertOperation)
    expect(collection.get('item-1')).toEqual({ id: 'item-1', name: 'test 2' })
  })
})
describe('consistency', () => {
  const store1 = createCollection(store)
  const store2 = createCollection(store)
  const insert1: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-1',
    type: YOBTA_COLLECTION_INSERT,
    channel: 'test',
    data: { id: 'item-1', name: 'test' },
    snapshotId: 'item-1',
    committed: 1,
    merged: 1,
  }
  const insert2: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-2',
    type: YOBTA_COLLECTION_INSERT,
    channel: 'test',
    data: { id: 'item-2', name: 'test' },
    snapshotId: 'item-2',
    committed: 2,
    merged: 2,
  }
  const update1: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-3',
    type: YOBTA_COLLECTION_UPDATE,
    channel: 'test',
    data: { name: 'test 2' },
    snapshotId: 'item-1',
    committed: 3,
    merged: 3,
  }
  const update2: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-4',
    type: YOBTA_COLLECTION_UPDATE,
    channel: 'test',
    data: { name: 'test 3' },
    snapshotId: 'item-1',
    committed: 4,
    merged: 4,
  }
  it('should be consistent', () => {
    store1.merge([insert1, insert2, update1, update2])
    store2.merge([update2, insert1, update1, insert2, update2, insert1])
    expect(store1.get('item-1')).toEqual(store2.get('item-1'))
    expect(store1.get('item-2')).toEqual(store2.get('item-2'))
  })
})
// describe('middleware', () => {
//   it('should enqueue operations and hydrate state', () => {
//     const updateOperation: YobtaCollectionUpdateOperation<Snapshot> = {
//       id: 'op-2',
//       type: YOBTA_COLLECTION_UPDATE,
//       channel: 'test',
//       data: { name: 'test 2' },
//       snapshotId: 'item-1',
//       committed: 2,
//       merged: 0,
//     }
//     const storedState: YobtaCollectionState<Snapshot> = new Map([
//       [
//         'item-1',
//         [{ id: 'item-1', name: 'test 2' }, { id: 1, name: 1 }, updateOperation],
//       ],
//     ])
//     const collection = createCollection([])
//     expect(queueOperation).not.toHaveBeenCalled()
//     expect(collection.last()).toEqual(new Map())
//     const unobserve = collection.observe(() => {})
//     expect(queueOperation).toHaveBeenCalledOnce()
//     expect(queueOperation).toHaveBeenCalledWith(updateOperation, 0, [
//       updateOperation,
//     ])
//     expect(collection.last()).toEqual(storedState)
//     unobserve()
//   })
// })
