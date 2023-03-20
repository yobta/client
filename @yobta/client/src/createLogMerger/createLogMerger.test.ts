import {
  YobtaCollectionId,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import {
  YobtaLogRejectEntry,
  YobtaLogInsertEntry,
} from '../createLog/createLog.js'
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

describe('inserts', () => {
  it('should merge single insert', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('should ignore insert entry if snapshot is not found', () => {
    const entry: YobtaLogInsertEntry = [
      'operation-1',
      'channel-1',
      1,
      1,
      YOBTA_COLLECTION_INSERT,
      'unknown-item',
      undefined,
      undefined,
    ]
    const result = merge([entry])
    expect(result).toEqual([])
  })
  it('resolves a, b => a', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_COLLECTION_INSERT,
        'item-2',
        'item-1',
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-2'], store['item-1']])
  })
  it('resolves a, b => a, c => a', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_COLLECTION_INSERT,
        'item-2',
        'item-1',
        undefined,
      ],
      [
        'operation-3',
        'channel-1',
        3,
        3,
        YOBTA_COLLECTION_INSERT,
        'item-3',
        'item-1',
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-2'], store['item-3'], store['item-1']])
  })
  it('resolves a, b => a, c => b', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_COLLECTION_INSERT,
        'item-2',
        'item-1',
        undefined,
      ],
      [
        'operation-3',
        'channel-1',
        3,
        3,
        YOBTA_COLLECTION_INSERT,
        'item-3',
        'item-2',
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-3'], store['item-2'], store['item-1']])
  })
})
describe('moves', () => {
  it('ignores move if log is empty', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_MOVE,
        'item-1',
        'item-2',
        undefined,
      ],
    ])
    expect(result).toEqual([])
  })
  it('resolves a, c => b', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_MOVE,
        'item-3',
        'item-2',
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('resolves a, a => b', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_MOVE,
        'item-1',
        'item-2',
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('resolves a, b, b => a', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_COLLECTION_INSERT,
        'item-2',
        undefined,
        undefined,
      ],
      [
        'operation-3',
        'channel-1',
        3,
        3,
        YOBTA_COLLECTION_MOVE,
        'item-2',
        'item-1',
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-2'], store['item-1']])
  })
  it('resolves a, b, a => a', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_COLLECTION_INSERT,
        'item-2',
        undefined,
        undefined,
      ],
      [
        'operation-3',
        'channel-1',
        3,
        3,
        YOBTA_COLLECTION_MOVE,
        'item-1',
        'item-1',
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-1'], store['item-2']])
  })
  it('resolves a, b, b => a, a => b', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_COLLECTION_INSERT,
        'item-2',
        undefined,
        undefined,
      ],
      [
        'operation-3',
        'channel-1',
        3,
        3,
        YOBTA_COLLECTION_MOVE,
        'item-2',
        'item-1',
        undefined,
      ],
      [
        'operation-4',
        'channel-1',
        4,
        4,
        YOBTA_COLLECTION_MOVE,
        'item-1',
        'item-2',
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-1'], store['item-2']])
  })
})
describe('rejects', () => {
  it('should ignore reject insert if the order is correct', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_COLLECTION_INSERT,
        'item-2',
        undefined,
        undefined,
      ],
      [
        'operation-3',
        'channel-1',
        3,
        3,
        YOBTA_REJECT,
        undefined,
        undefined,
        'operation-1',
      ],
    ])
    expect(result).toEqual([store['item-2']])
  })
  it('should ignore reject insert if the order is incorrect', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_REJECT,
        undefined,
        undefined,
        'operation-1',
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('should ignore rejected opertaion that not in the log', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_REJECT,
        undefined,
        undefined,
        'operation-1',
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-x-log-entry',
        'channel-1',
        3,
        3,
        YOBTA_REJECT,
        undefined,
        undefined,
        'operation-x',
      ],
    ])
    expect(result).toEqual([store['item-1']])
  })
  it('should resolve insert reject insert sequence', () => {
    const result = merge([
      [
        'operation-1',
        'channel-1',
        1,
        1,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
      [
        'operation-2',
        'channel-1',
        2,
        2,
        YOBTA_REJECT,
        undefined,
        undefined,
        'operation-1',
      ],
      [
        'operation-1',
        'channel-1',
        3,
        3,
        YOBTA_COLLECTION_INSERT,
        'item-1',
        undefined,
        undefined,
      ],
    ])
    expect(result).toEqual([store['item-1']])
  })
})
describe('unknown operations', () => {
  it('should throw if operation is not supportes unknown', () => {
    expect(() => {
      merge([
        [
          'operation-1',
          'channel-1',
          1,
          1,
          'unknown' as any,
          'item-1',
          undefined,
          undefined,
        ],
      ])
    }).toThrow()
  })
})
