import {
  YobtaCollectionId,
  YOBTA_COLLECTION_INSERT,
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
  it('should ignore rejected opertaion that not in the log', () => {
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
    const rejectx: YobtaLogRejectEntry = [
      'operation-x-log-entry',
      'channel-1',
      3,
      3,
      YOBTA_REJECT,
      undefined,
      undefined,
      'operation-x',
    ]
    const result = merge([reject1, insert1, rejectx])
    expect(result).toEqual([store['item-1']])
  })
})
