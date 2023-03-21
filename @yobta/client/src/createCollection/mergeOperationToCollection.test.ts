import {
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { mergeOperationToCollection } from './mergeOperationToCollection.js'

type Snapshot = {
  id: string
  name: string
}

it('should apply insert operation', () => {
  const item = mergeOperationToCollection([{ id: 'item-1' }, { id: 0 }], {
    id: 'op-1',
    type: YOBTA_COLLECTION_INSERT,
    channel: 'test',
    data: { id: 'item-1', name: 'test' },
    snapshotId: 'item-1',
    committed: 1,
    merged: 1,
  })
  expect(item).toEqual([
    { id: 'item-1', name: 'test' },
    { id: 1, name: 1 },
  ])
})
it('should apply update operation', () => {
  const item = mergeOperationToCollection(
    [
      { id: 'item-1', name: 'test' },
      { id: 1, name: 1 },
    ],
    {
      id: 'op-2',
      channel: 'test',
      type: YOBTA_COLLECTION_UPDATE,
      data: { name: 'test2' },
      snapshotId: 'item-1',
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
  const nextItem = mergeOperationToCollection(item as any, {
    id: 'op-2',
    type: YOBTA_COLLECTION_UPDATE,
    channel: 'test',
    data: { name: 'test2' },
    snapshotId: 'item-1',
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
  const nextItem = mergeOperationToCollection(item as any, {
    id: 'op-2',
    type: YOBTA_COLLECTION_UPDATE,
    channel: 'test',
    data: { name: 'test2' },
    snapshotId: 'item-1',
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
    data: { name: 'test2' },
    snapshotId: 'item-1',
    committed: 2,
    merged: 2,
  }
  const operation2: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-3',
    type: YOBTA_COLLECTION_UPDATE,
    channel: 'test',
    data: { name: 'test3' },
    snapshotId: 'item-1',
    committed: 3,
    merged: 3,
  }
  const item = mergeOperationToCollection(
    [{ id: 'item-1', name: 'test' }, { id: 1, name: 1 }, operation, operation2],
    operation,
  )
  expect(item).toEqual([
    { id: 'item-1', name: 'test2' },
    { id: 1, name: 2 },
    operation2,
  ])
})
