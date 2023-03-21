import {
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { mergeOperationsToCollection } from './mergeOperationsToCollection.js'

it('should apply insert operation', () => {
  const mockState = new Map()
  mergeOperationsToCollection(mockState, [
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
  expect(mockState.get('item-1')).toEqual([
    { id: 'item-1', name: 'test' },
    { id: 1, name: 1 },
  ])
})
it('should apply update operation', () => {
  const mockState = new Map()
  mergeOperationsToCollection(mockState, [
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
      data: { name: 'test2' },
      snapshotId: 'item-1',
      committed: 2,
      merged: 2,
    },
  ])
  expect(mockState.get('item-1')).toEqual([
    { id: 'item-1', name: 'test2' },
    { id: 1, name: 2 },
  ])
})
