import {
  YobtaCollectionId,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { createLogMerger } from './createLogMerger.js'

type MockSnapshot = {
  id: string
  name: string
}
type MockStore = {
  [id: string]: MockSnapshot
}

const store: MockStore = {
  'item-1': {
    id: 'item-1',
    name: 'Item 1',
  },
  'item-2': {
    id: 'item-2',
    name: 'Item 2',
  },
  'item-3': {
    id: 'item-3',
    name: 'Item 3',
  },
}
const getSnapshot = (id: YobtaCollectionId): MockSnapshot | undefined => {
  return store[id]
}

const merge = createLogMerger(getSnapshot)

describe('insertions', () => {
  it('should merge single insert', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('should ignore insert entry if snapshot is not found', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'unknown-item',
          name: 'Unknown Item',
        },
        snapshotId: 'unknown-item',
      },
    ])
    expect(result).toEqual([])
  })
  it('resolves a, b => a', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-2',
          name: 'Item 2',
        },
        snapshotId: 'item-2',
        nextSnapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-2'], store['item-1']])
  })
  it('resolves a, b => a, c => a', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-2',
          name: 'Item 2',
        },
        snapshotId: 'item-2',
        nextSnapshotId: 'item-1',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-3',
          name: 'Item 3',
        },
        snapshotId: 'item-3',
        nextSnapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-2'], store['item-3'], store['item-1']])
  })
  it('resolves a, b => a, c => b', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-2',
          name: 'Item 2',
        },
        snapshotId: 'item-2',
        nextSnapshotId: 'item-1',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-3',
          name: 'Item 3',
        },
        snapshotId: 'item-3',
        nextSnapshotId: 'item-2',
      },
    ])
    expect(result).toEqual([store['item-3'], store['item-2'], store['item-1']])
  })
})
describe('moves', () => {
  it('ignores move if log is empty', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_MOVE,
        snapshotId: 'item-1',
        nextSnapshotId: 'item-2',
      },
    ])
    expect(result).toEqual([])
  })
  it('resolves a, c => -b', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_MOVE,
        snapshotId: 'item-3',
        nextSnapshotId: 'item-2',
      },
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('resolves a, a => -b', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_MOVE,
        snapshotId: 'item-1',
        nextSnapshotId: 'item-2',
      },
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('resolves a, b, b => a', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-2',
          name: 'Item 2',
        },
        snapshotId: 'item-2',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_MOVE,
        snapshotId: 'item-2',
        nextSnapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-2'], store['item-1']])
  })
  it('resolves a, b, a => a', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-2',
          name: 'Item 2',
        },
        snapshotId: 'item-2',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_MOVE,
        snapshotId: 'item-1',
        nextSnapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-1'], store['item-2']])
  })
  it('resolves a, b, b => a, a => b', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-2',
          name: 'Item 2',
        },
        snapshotId: 'item-2',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_MOVE,
        snapshotId: 'item-2',
        nextSnapshotId: 'item-1',
      },
      {
        id: 'operation-4',
        channel: 'channel-1',
        committed: 4,
        merged: 4,
        type: YOBTA_COLLECTION_MOVE,
        snapshotId: 'item-1',
        nextSnapshotId: 'item-2',
      },
    ])
    expect(result).toEqual([store['item-1'], store['item-2']])
  })
})
describe('deletions', () => {
  it('ignores deletion if log is empty', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_DELETE,
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([])
  })
  it('resolves insert:a, delete:a', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_DELETE,
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([])
  })
  it('resolves insert:a, insert:b, delete:a', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-2',
          name: 'Item 2',
        },
        snapshotId: 'item-2',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_DELETE,
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-2']])
  })
  it('resolves insert:a, delete:a, insert:a', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_DELETE,
        snapshotId: 'item-1',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-1']])
  })
})
describe('undos', () => {
  it('ignores restore if log is empty', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_RESTORE,
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([])
  })
  it('resolves insert:a, delete:a, restore:a', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_DELETE,
        snapshotId: 'item-1',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_RESTORE,
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('resolves insert:a, delete:a, restore:a, delete:a', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_DELETE,
        snapshotId: 'item-1',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_COLLECTION_RESTORE,
        snapshotId: 'item-1',
      },
      {
        id: 'operation-4',
        channel: 'channel-1',
        committed: 4,
        merged: 4,
        type: YOBTA_COLLECTION_DELETE,
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([])
  })
})
describe('rejects', () => {
  it('should ignore reject insert if the order is correct', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-2',
          name: 'Item 2',
        },
        snapshotId: 'item-2',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_REJECT,
        operationId: 'operation-1',
        reason: 'reason',
      },
    ])
    expect(result).toEqual([store['item-2']])
  })
  it('should ignore reject insert if the order is incorrect', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_REJECT,
        operationId: 'operation-1',
        reason: 'reason',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('resolves: r:1, m:1, r:0', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_REJECT,
        operationId: 'operation-2',
        reason: 'reason',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-3',
        channel: 'channel-1',
        committed: 3,
        merged: 3,
        type: YOBTA_REJECT,
        operationId: 'operation-0',
        reason: 'reason',
      },
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('resolves c:1, r:1, m:1', () => {
    const result = merge([
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 0,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-1',
          name: 'Item 1',
        },
        snapshotId: 'item-1',
      },
      {
        id: 'operation-2',
        channel: 'channel-1',
        committed: 2,
        merged: 2,
        type: YOBTA_REJECT,
        operationId: 'operation-1',
        reason: 'reason',
      },
      {
        id: 'operation-1',
        channel: 'channel-1',
        committed: 1,
        merged: 1,
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'item-2',
          name: 'Item 2',
        },
        snapshotId: 'item-1',
      },
    ])
    expect(result).toEqual([store['item-1']])
  })
})
describe('unknown operations', () => {
  it('should throw if operation is not supportes unknown', () => {
    expect(() => {
      merge([
        {
          id: 'operation-1',
          channel: 'channel-1',
          committed: 1,
          merged: 1,
          type: 'unknown' as any,
          snapshotId: 'item-1',
        },
      ])
    }).toThrow()
  })
})
