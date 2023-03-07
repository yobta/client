import {
  YobtaCollectionId,
  YOBTA_COLLECTION_INSERT,
  YOBTA_MERGE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import {
  YobtaLogRejectEntry,
  YobtaLogInsertEntry,
  YobtaLogMergeEntry,
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
}
const getSnapshot = (id: YobtaCollectionId): MockSnapshot | undefined => {
  return store[id]
}

const merge = createLogMerger(getSnapshot)

describe('inserts', () => {
  it('should convert insert entry to value', () => {
    const entry: YobtaLogInsertEntry = [
      'operation-1',
      'channel-1',
      1,
      1,
      YOBTA_COLLECTION_INSERT,
      'item-1',
      undefined,
      undefined,
    ]
    const result = merge([entry])
    expect(result).toEqual([store['item-1']])
  })
  it('should ignore insert entry if snapshot is not found', () => {
    const entry: YobtaLogInsertEntry = [
      'operation-1',
      'channel-1',
      1,
      1,
      YOBTA_COLLECTION_INSERT,
      'item-3',
      undefined,
      undefined,
    ]
    const result = merge([entry])
    expect(result).toEqual([])
  })
  it('should resort items by nextSnapshotId', () => {
    const insert1: YobtaLogInsertEntry = [
      'operation-1',
      'channel-1',
      1,
      1,
      YOBTA_COLLECTION_INSERT,
      'item-1',
      undefined,
      undefined,
    ]
    const insert2: YobtaLogInsertEntry = [
      'operation-2',
      'channel-1',
      2,
      2,
      YOBTA_COLLECTION_INSERT,
      'item-2',
      'item-1',
      undefined,
    ]
    const result = merge([insert1, insert2])
    expect(result).toEqual([store['item-2'], store['item-1']])
  })
})
describe('rejects', () => {
  it('should ignore reject insert if the order is correct', () => {
    const insert1: YobtaLogInsertEntry = [
      'operation-1',
      'channel-1',
      1,
      1,
      YOBTA_COLLECTION_INSERT,
      'item-1',
      undefined,
      undefined,
    ]
    const insert2: YobtaLogInsertEntry = [
      'operation-2',
      'channel-1',
      2,
      2,
      YOBTA_COLLECTION_INSERT,
      'item-2',
      undefined,
      undefined,
    ]
    const reject1: YobtaLogRejectEntry = [
      'operation-3',
      'channel-1',
      3,
      3,
      YOBTA_REJECT,
      undefined,
      undefined,
      'operation-1',
    ]
    const result = merge([insert1, insert2, reject1])
    expect(result).toEqual([store['item-2']])
  })
  it('should ignore reject insert if the order is incorrect', () => {
    const reject1: YobtaLogRejectEntry = [
      'operation-1',
      'channel-1',
      1,
      1,
      YOBTA_REJECT,
      undefined,
      undefined,
      'operation-1',
    ]
    const insert1: YobtaLogInsertEntry = [
      'operation-2',
      'channel-1',
      2,
      2,
      YOBTA_COLLECTION_INSERT,
      'item-1',
      undefined,
      undefined,
    ]
    const result = merge([reject1, insert1])
    expect(result).toEqual([store['item-1']])
  })
})
describe('merges', () => {
  it('should change order when committed is changed', () => {
    const insert1: YobtaLogInsertEntry = [
      'operation-1',
      'channel-1',
      1,
      1,
      YOBTA_COLLECTION_INSERT,
      'item-1',
      undefined,
      undefined,
    ]
    const insert2: YobtaLogInsertEntry = [
      'operation-2',
      'channel-1',
      2,
      2,
      YOBTA_COLLECTION_INSERT,
      'item-2',
      undefined,
      undefined,
    ]
    const merge1: YobtaLogMergeEntry = [
      'operation-3',
      'channel-1',
      3,
      3,
      YOBTA_MERGE,
      undefined,
      undefined,
      'operation-1',
    ]
    const result = merge([insert1, insert2, merge1])
    expect(result).toEqual([store['item-2'], store['item-1']])
  })
  it('should not change order when committed is not changed', () => {
    const insert1: YobtaLogInsertEntry = [
      'operation-1',
      'channel-1',
      1,
      1,
      YOBTA_COLLECTION_INSERT,
      'item-1',
      undefined,
      undefined,
    ]
    const insert2: YobtaLogInsertEntry = [
      'operation-2',
      'channel-1',
      2,
      2,
      YOBTA_COLLECTION_INSERT,
      'item-2',
      undefined,
      undefined,
    ]
    const merge1: YobtaLogMergeEntry = [
      'operation-3',
      'channel-1',
      1,
      3,
      YOBTA_MERGE,
      undefined,
      undefined,
      'operation-1',
    ]
    const result = merge([insert1, merge1, insert2])
    expect(result).toEqual([store['item-1'], store['item-2']])
  })
  it('should ignore merge if the order is incorrect', () => {
    const merge1: YobtaLogMergeEntry = [
      'operation-1',
      'channel-1',
      1,
      1,
      YOBTA_MERGE,
      undefined,
      undefined,
      'operation-1',
    ]
    const insert1: YobtaLogInsertEntry = [
      'operation-2',
      'channel-1',
      2,
      2,
      YOBTA_COLLECTION_INSERT,
      'item-1',
      undefined,
      undefined,
    ]
    const insert2: YobtaLogInsertEntry = [
      'operation-3',
      'channel-1',
      3,
      3,
      YOBTA_COLLECTION_INSERT,
      'item-2',
      undefined,
      undefined,
    ]
    const result = merge([merge1, insert1, insert2])
    expect(result).toEqual([store['item-1'], store['item-2']])
  })
})
