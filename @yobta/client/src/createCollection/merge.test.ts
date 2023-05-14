import {
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_CREATE,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { merge } from './merge.js'

type Snapshot = {
  id: string
  name: string
}

it('should apply insert operation', () => {
  const item = merge([{ id: 'item-1' }, { id: 0 }], {
    id: 'op-1',
    type: YOBTA_COLLECTION_CREATE,
    channel: 'test',
    data: { id: 'item-1', name: 'test' },
    committed: 1,
    merged: 1,
  })
  expect(item).toEqual([
    { id: 'item-1', name: 'test' },
    { id: 1, name: 1 },
  ])
})
it('should apply update operation', () => {
  const item = merge<Snapshot>(
    [
      { id: 'item-1', name: 'test' },
      { id: 1, name: 1 },
    ],
    {
      id: 'op-2',
      channel: 'test',
      type: YOBTA_COLLECTION_UPDATE,
      data: {
        id: 'item-1',
        name: 'test2',
      },
      committed: 2,
      merged: 2,
    },
  )
  expect(item).toEqual([
    { id: 'item-1', name: 'test2' },
    { id: 1, name: 2 },
  ])
})
it('should not mutate item', () => {
  const item = [
    { id: 'item-1', name: 'test' },
    { id: 1, name: 1 },
  ]
  const nextItem = merge(item as any, {
    id: 'op-2',
    type: YOBTA_COLLECTION_UPDATE,
    channel: 'test',
    data: {
      id: 'item-1',
      name: 'test2',
    },
    committed: 2,
    merged: 2,
  })
  expect(item).not.toBe(nextItem)
})
it('should not mutate versions', () => {
  const item = [
    { id: 'item-1', name: 'test' },
    { id: 1, name: 1 },
  ]
  const nextItem = merge(item as any, {
    id: 'op-2',
    type: YOBTA_COLLECTION_UPDATE,
    channel: 'test',
    data: {
      id: 'item-1',
      name: 'test2',
    },
    committed: 2,
    merged: 2,
  })
  expect(item).not.toBe(nextItem)
})
it('should remove pending operation', () => {
  const operation: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-2',
    type: YOBTA_COLLECTION_UPDATE,
    channel: 'test',
    data: {
      id: 'item-1',
      name: 'test2',
    },
    committed: 2,
    merged: 2,
  }
  const operation2: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-3',
    type: YOBTA_COLLECTION_UPDATE,
    channel: 'test',
    data: {
      id: 'item-1',
      name: 'test3',
    },
    committed: 3,
    merged: 3,
  }
  const item = merge(
    [{ id: 'item-1', name: 'test' }, { id: 1, name: 1 }, operation, operation2],
    operation,
  )
  expect(item).toEqual([
    { id: 'item-1', name: 'test2' },
    { id: 1, name: 2 },
    operation2,
  ])
})
