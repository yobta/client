import { YOBTA_COLLECTION_INSERT } from '@yobta/protocol'

import { createCollection } from './createCollection.js'
import { getCollecionEntry } from './getCollecionEntry.js'

type Snapshot = {
  id: string
  name: string
}

it('should create item if it does not exist', () => {
  const mockState = new Map()
  const item = getCollecionEntry(mockState, 'item-1')
  expect(item).toEqual([{ id: 'item-1' }, { id: 0 }])
})
it('should get item if it exists', () => {
  const collection = createCollection<Snapshot>([])
  collection.merge([
    {
      id: 'op-1',
      channel: 'test',
      type: YOBTA_COLLECTION_INSERT,
      data: { id: 'item-1', name: 'test' },
      snapshotId: 'item-1',
      committed: 1,
      merged: 1,
    },
  ])
  const item = getCollecionEntry(collection.last(), 'item-1')
  expect(item).toEqual([
    { id: 'item-1', name: 'test' },
    { id: 1, name: 1 },
  ])
})
