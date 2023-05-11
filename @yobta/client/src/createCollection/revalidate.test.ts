import {
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaCollectionEntry } from './createCollection.js'
import { revalidate } from './revalidate.js'

type Snapshot = {
  id: string
  name: string
}

it('should apply revalidate operation', () => {
  const item = revalidate([{ id: '' }, { id: 0 }], {
    id: 'op-1',
    type: YOBTA_COLLECTION_REVALIDATE,
    channel: 'channel',
    data: [
      ['id', 'item-1', 1, 2],
      ['name', 'john', 2, 3],
    ],
    snapshotId: 'item-1',
    committed: 1,
    merged: 2,
  })
  expect(item).toEqual([
    { id: 'item-1', name: 'john' },
    { id: 1, name: 2 },
  ])
})
it('should respect committed', () => {
  const item = revalidate(
    [
      { id: 'item-1', name: 'john', email: 'j@m.com' },
      { id: 1, name: 5, email: 5 },
    ],
    {
      id: 'op-1',
      type: YOBTA_COLLECTION_REVALIDATE,
      channel: 'channel',
      data: [
        ['id', 'item-1', 1, 2],
        ['name', 'jane', 1, 2],
        ['email', 'bill@microsoft.com', 6, 7],
      ],
      snapshotId: 'item-1',
      committed: 1,
      merged: 2,
    },
  )
  expect(item).toEqual([
    { id: 'item-1', name: 'john', email: 'bill@microsoft.com' },
    { id: 1, name: 5, email: 6 },
  ])
})
it('should not mutate entry', () => {
  const entry: YobtaCollectionEntry<Snapshot> = [
    { id: 'item-1', name: 'john' },
    { id: 1, name: 5 },
  ]
  const nextEntry = revalidate(entry, {
    id: 'op-1',
    type: YOBTA_COLLECTION_REVALIDATE,
    channel: 'channel',
    data: [
      ['id', 'item-1', 1, 2],
      ['name', 'jane', 1, 2],
    ],
    snapshotId: 'item-1',
    committed: 1,
    merged: 2,
  })
  expect(entry).not.toBe(nextEntry)
})
it('should return same pending operations', () => {
  const entry: YobtaCollectionEntry<Snapshot> = [
    { id: 'item-1', name: 'john' },
    { id: 1, name: 5 },
    {
      id: 'op-1',
      type: YOBTA_COLLECTION_UPDATE,
      channel: 'channel',
      data: {
        id: 'item-1',
        name: 'jane',
      },
      committed: 1,
      merged: 0,
    },
  ]
  const nextEntry = revalidate(entry, {
    id: 'op-1',
    type: YOBTA_COLLECTION_REVALIDATE,
    channel: 'channel',
    data: [
      ['id', 'item-1', 1, 2],
      ['name', 'jane', 1, 2],
    ],
    snapshotId: 'item-1',
    committed: 1,
    merged: 2,
  })
  expect(entry.slice(2)).toEqual(nextEntry.slice(2))
})
