import {
  YobtaCollectionInsert,
  YobtaCollectionDelete,
  YOBTA_COLLECTION_DELETE,
  YobtaCollectionUpdate,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { mergeOperation } from './mergeOperation.js'
import { Snapshot } from './mergeLog.js'

type TestData = {
  readonly id: string
  value: string
}

it('should insert new items into the state map', () => {
  const state: Snapshot<TestData> = new Map()
  const operation: YobtaCollectionInsert = {
    id: 'op1',
    channel: 'test-channel',
    time: Date.now(),
    type: 'collection-insert',
    data: {
      id: 'item1',
      value: 'test value',
    },
  }

  mergeOperation(state, operation)
  expect(state.has('item1')).toBeTruthy()

  mergeOperation(state, operation)
  expect(state.has('item1')).toBeTruthy()
})

it('should mark existing items as deleted in the state map and', () => {
  const state: Snapshot<TestData> = new Map()
  state.set('item1', {
    data: { id: 'item1', value: 'test value' },
    deleted: false,
  })

  const operation: YobtaCollectionDelete = {
    id: 'op1',
    channel: 'test-channel',
    time: Date.now(),
    type: YOBTA_COLLECTION_DELETE,
    ref: 'item1',
  }

  mergeOperation(state, operation)
  expect(state.get('item1')!.deleted).toBeTruthy()

  mergeOperation(state, operation)
  expect(state.get('item1')!.deleted).toBeTruthy()
})

it('should insert items before the specified reference item', () => {
  const state: Snapshot<TestData> = new Map()
  state.set('item1', {
    data: { id: 'item1', value: 'test value 1' },
    deleted: false,
  })
  state.set('item2', {
    data: { id: 'item2', value: 'test value 2' },
    deleted: false,
  })

  const operation: YobtaCollectionInsert = {
    id: 'item3',
    channel: 'test-channel',
    time: Date.now(),
    type: 'collection-insert',
    data: {
      id: 'item3',
      value: 'test value 3',
    },
    ref: 'item2',
  }

  mergeOperation(state, operation)
  expect(Array.from(state.keys())).toEqual(['item1', 'item3', 'item2'])

  mergeOperation(state, operation)
  expect(Array.from(state.keys())).toEqual(['item1', 'item3', 'item2'])
})

it('should assign new values to existing items', () => {
  const state: Snapshot<TestData> = new Map()
  state.set('item1', {
    data: { id: 'item1', value: 'test value 1' },
    deleted: false,
  })
  const operation: YobtaCollectionUpdate = {
    id: 'op1',
    channel: 'test-channel',
    time: Date.now(),
    type: YOBTA_COLLECTION_UPDATE,
    ref: 'item1',
    data: {
      value: 'test value 2',
    },
  }
  mergeOperation(state, operation)
  expect(state.get('item1')!.data.value).toEqual('test value 2')
})

it('should ignore assign operations with invalid references', () => {
  const state: Snapshot<TestData> = new Map()
  state.set('item1', {
    data: { id: 'item1', value: 'test value 1' },
    deleted: false,
  })
  const operation: YobtaCollectionUpdate = {
    id: 'op1',
    channel: 'test-channel',
    time: Date.now(),
    type: YOBTA_COLLECTION_UPDATE,
    ref: 'item2',
    data: {
      value: 'test value 2',
    },
  }
  mergeOperation(state, operation)
  expect(state.get('item1')!.data.value).toEqual('test value 1')
})
