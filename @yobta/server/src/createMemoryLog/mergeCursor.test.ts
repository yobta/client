import {
  YobtaCollectionDeleteOperation,
  YobtaCollectionInsertOperation,
  YobtaCollectionMoveOperation,
  YobtaCollectionRestoreOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'
import { mergeCursor } from './mergeCursor.js'

type Snapshot = {
  id: string
  name: string
}

const merged = 4566465

it('returns same log if operation is not insert', () => {
  const operation: YobtaCollectionUpdateOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_UPDATE,
    data: {
      name: 'john',
    },
    committed: 1,
    merged: 2,
    snapshotId: 'id',
    channel: 'channel',
  }
  const log: YobtaServerLogItem[] = []
  const result = mergeCursor({
    log,
    collection: 'collection',
    merged,
    operation,
  })
  expect(result).toBe(log)
  expect(result).toEqual(log)
})

describe('insert', () => {
  it('inserts to empty log', () => {
    const log: YobtaServerLogItem[] = []
    const result = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-id-1',
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'id-2',
          name: 'john',
        },
        committed: 4,
        merged: 0,
        snapshotId: 'id-2',
        channel: 'channel',
      },
    })
    expect(result).toEqual([
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-id-1',
        snapshotId: 'id-2',
        collection: 'collection',
        committed: 4,
        channel: 'channel',
        merged,
        nextSnapshotId: undefined,
      },
    ])
  })
  it('appends insert to another insert', () => {
    const log: YobtaServerLogItem[] = [
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-id-1',
        snapshotId: 'id-1',
        collection: 'collection',
        committed: 2,
        channel: 'channel',
        merged: 3,
        nextSnapshotId: undefined,
      },
    ]
    const result = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-id-2',
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'id-2',
          name: 'john',
        },
        committed: 4,
        merged: 0,
        snapshotId: 'id-2',
        channel: 'channel',
      },
    })
    expect(result).toEqual([
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-id-1',
        snapshotId: 'id-1',
        collection: 'collection',
        committed: 2,
        channel: 'channel',
        merged: 3,
        nextSnapshotId: undefined,
      },
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-id-2',
        snapshotId: 'id-2',
        collection: 'collection',
        committed: 4,
        channel: 'channel',
        merged,
        nextSnapshotId: undefined,
      },
    ])
  })
  it('appends insert to another revalidate entry', () => {
    const log: YobtaServerLogItem[] = [
      {
        type: YOBTA_COLLECTION_REVALIDATE,
        operationId: 'op-id-1',
        snapshotId: 'id-1',
        collection: 'collection',
        committed: 2,
        merged: 3,
        nextSnapshotId: undefined,
        key: 'key',
        value: 'value',
      },
    ]
    const result = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-id-2',
        type: YOBTA_COLLECTION_INSERT,
        data: {
          id: 'id-2',
          name: 'john',
        },
        committed: 4,
        merged: 0,
        snapshotId: 'id-2',
        channel: 'channel',
      },
    })
    expect(result).toEqual([
      {
        type: YOBTA_COLLECTION_REVALIDATE,
        operationId: 'op-id-1',
        snapshotId: 'id-1',
        collection: 'collection',
        committed: 2,
        merged: 3,
        nextSnapshotId: undefined,
        key: 'key',
        value: 'value',
      },
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-id-2',
        snapshotId: 'id-2',
        collection: 'collection',
        committed: 4,
        channel: 'channel',
        merged,
        nextSnapshotId: undefined,
      },
    ])
  })
  it('updates merged to the current time', () => {
    const log: YobtaServerLogItem[] = []
    const operation: YobtaCollectionInsertOperation<Snapshot> = {
      id: 'op-id',
      type: YOBTA_COLLECTION_INSERT,
      data: {
        id: 'id-2',
        name: 'john',
      },
      committed: 4,
      merged: 0,
      snapshotId: 'id-2',
      channel: 'channel',
    }
    const result = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation,
    })
    expect(result[0].merged).toBe(merged)
  })
})

describe('update', () => {
  it('ignores update if there is no previous insert', () => {
    const log: YobtaServerLogItem[] = []
    const operation: YobtaCollectionUpdateOperation<Snapshot> = {
      id: 'op-id',
      type: YOBTA_COLLECTION_UPDATE,
      channel: 'channel',
      snapshotId: 'id',
      data: {
        name: 'john',
      },
      committed: 1,
      merged: 2,
    }
    const result = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation,
    })
    expect(result).toEqual([])
    expect(result).toBe(log)
  })
})
describe('delete', () => {
  it('inserts delete entry', () => {
    const log: YobtaServerLogItem[] = []
    const operation: YobtaCollectionDeleteOperation = {
      id: 'op-id',
      type: YOBTA_COLLECTION_DELETE,
      channel: 'channel',
      snapshotId: 'id',
      committed: 1,
      merged: 2,
    }
    const result = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation,
    })
    expect(result).toEqual([
      {
        type: YOBTA_COLLECTION_DELETE,
        operationId: 'op-id',
        snapshotId: 'id',
        collection: 'collection',
        channel: 'channel',
        committed: 1,
        merged,
      },
    ])
    expect(result).toBe(log)
  })
  it('handles: insert, delete', () => {
    const log: YobtaServerLogItem[] = []
    const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
      id: 'op-1',
      type: YOBTA_COLLECTION_INSERT,
      channel: 'channel',
      data: {
        id: 'id-2',
        name: 'john',
      },
      snapshotId: 'id-2',
      committed: 1,
      merged: 0,
    }
    const deleteOperation: YobtaCollectionDeleteOperation = {
      id: 'op-2',
      type: YOBTA_COLLECTION_DELETE,
      channel: 'channel',
      snapshotId: 'id-2',
      committed: 2,
      merged: 0,
    }

    const log1 = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation: insertOperation,
    })
    const log2 = mergeCursor({
      log: log1,
      collection: 'collection',
      merged,
      operation: deleteOperation,
    })
    expect(log2).toEqual([
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-1',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        nextSnapshotId: undefined,
        committed: 1,
        merged,
      },
      {
        type: YOBTA_COLLECTION_DELETE,
        operationId: 'op-2',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged,
      },
    ])
    expect(log2).toBe(log)
  })
  it('handles: insert, delete, duplicating insert', () => {
    const log: YobtaServerLogItem[] = []
    const log1 = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'channel',
        data: {
          id: 'id-2',
          name: 'john',
        },
        snapshotId: 'id-2',
        committed: 1,
        merged: 0,
      },
    })
    const log2 = mergeCursor({
      log: log1,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-2',
        type: YOBTA_COLLECTION_DELETE,
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged: 0,
      },
    })
    const log3 = mergeCursor({
      log: log2,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'channel',
        data: {
          id: 'id-2',
          name: 'john',
        },
        snapshotId: 'id-2',
        committed: 1,
        merged: 0,
      },
    })
    expect(log3).toEqual([
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-1',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        nextSnapshotId: undefined,
        committed: 1,
        merged,
      },
      {
        type: YOBTA_COLLECTION_DELETE,
        operationId: 'op-2',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged,
      },
    ])
    expect(log2).toBe(log)
  })
  it('handles: insert, delete, restore', () => {
    const log: YobtaServerLogItem[] = []
    const log1 = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'channel',
        data: {
          id: 'id-2',
          name: 'john',
        },
        snapshotId: 'id-2',
        committed: 1,
        merged: 0,
      },
    })
    const log2 = mergeCursor({
      log: log1,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-2',
        type: YOBTA_COLLECTION_DELETE,
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged: 0,
      },
    })
    const log3 = mergeCursor({
      log: log2,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-3',
        type: YOBTA_COLLECTION_RESTORE,
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 3,
        merged: 0,
      },
    })
    expect(log3).toEqual([
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-1',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        nextSnapshotId: undefined,
        committed: 1,
        merged,
      },
      {
        type: YOBTA_COLLECTION_DELETE,
        operationId: 'op-2',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged,
      },
      {
        type: YOBTA_COLLECTION_RESTORE,
        operationId: 'op-3',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 3,
        merged,
      },
    ])
    expect(log2).toBe(log)
  })
  it('handles: insert, delete, restore, duplicating delete', () => {
    const log: YobtaServerLogItem[] = []
    const log1 = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'channel',
        data: {
          id: 'id-2',
          name: 'john',
        },
        snapshotId: 'id-2',
        committed: 1,
        merged: 0,
      },
    })
    const log2 = mergeCursor({
      log: log1,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-2',
        type: YOBTA_COLLECTION_DELETE,
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged: 0,
      },
    })
    const log3 = mergeCursor({
      log: log2,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-3',
        type: YOBTA_COLLECTION_RESTORE,
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 3,
        merged: 0,
      },
    })
    const log4 = mergeCursor({
      log: log3,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-2',
        type: YOBTA_COLLECTION_DELETE,
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged: 0,
      },
    })
    expect(log4).toEqual([
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-1',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        nextSnapshotId: undefined,
        committed: 1,
        merged,
      },
      {
        type: YOBTA_COLLECTION_DELETE,
        operationId: 'op-2',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged,
      },
      {
        type: YOBTA_COLLECTION_RESTORE,
        operationId: 'op-3',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 3,
        merged,
      },
    ])
    expect(log2).toBe(log)
  })
  it('handles: insert, delete, restore, delete again', () => {
    const log: YobtaServerLogItem[] = []
    const log1 = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'channel',
        data: {
          id: 'id-2',
          name: 'john',
        },
        snapshotId: 'id-2',
        committed: 1,
        merged: 0,
      },
    })
    const log2 = mergeCursor({
      log: log1,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-2',
        type: YOBTA_COLLECTION_DELETE,
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged: 0,
      },
    })
    const log3 = mergeCursor({
      log: log2,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-3',
        type: YOBTA_COLLECTION_RESTORE,
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 3,
        merged: 0,
      },
    })
    const log4 = mergeCursor({
      log: log3,
      collection: 'collection',
      merged,
      operation: {
        id: 'op-4',
        type: YOBTA_COLLECTION_DELETE,
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 4,
        merged: 0,
      },
    })
    expect(log4).toEqual([
      {
        type: YOBTA_COLLECTION_INSERT,
        operationId: 'op-1',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        nextSnapshotId: undefined,
        committed: 1,
        merged,
      },
      {
        type: YOBTA_COLLECTION_DELETE,
        operationId: 'op-2',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 2,
        merged,
      },
      {
        type: YOBTA_COLLECTION_RESTORE,
        operationId: 'op-3',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 3,
        merged,
      },
      {
        type: YOBTA_COLLECTION_DELETE,
        operationId: 'op-4',
        collection: 'collection',
        channel: 'channel',
        snapshotId: 'id-2',
        committed: 4,
        merged,
      },
    ])
  })
  // it('handles: insert, delete, restore, insert', () => {})
})
describe('restore', () => {
  it('inserts restore entry', () => {
    const log: YobtaServerLogItem[] = []
    const operation: YobtaCollectionRestoreOperation = {
      id: 'op-id',
      type: YOBTA_COLLECTION_RESTORE,
      channel: 'channel',
      snapshotId: 'id',
      committed: 1,
      merged: 2,
    }
    const result = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation,
    })
    expect(result).toEqual([
      {
        type: YOBTA_COLLECTION_RESTORE,
        operationId: 'op-id',
        snapshotId: 'id',
        collection: 'collection',
        channel: 'channel',
        committed: 1,
        merged,
      },
    ])
    expect(result).toBe(log)
  })
})
describe('move', () => {
  it('inserts move entry', () => {
    const log: YobtaServerLogItem[] = []
    const operation: YobtaCollectionMoveOperation = {
      id: 'op-id',
      type: YOBTA_COLLECTION_MOVE,
      channel: 'channel',
      snapshotId: 'id',
      nextSnapshotId: 'id-2',
      committed: 1,
      merged: 2,
    }
    const result = mergeCursor({
      log,
      collection: 'collection',
      merged,
      operation,
    })
    expect(result).toEqual([
      {
        type: YOBTA_COLLECTION_MOVE,
        operationId: 'op-id',
        snapshotId: 'id',
        nextSnapshotId: 'id-2',
        collection: 'collection',
        channel: 'channel',
        committed: 1,
        merged,
      },
    ])
    expect(result).toBe(log)
  })
})

it('does not mutate the log', () => {
  const log: YobtaServerLogItem[] = []
  const operation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'op-id',
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'id-2',
      name: 'john',
    },
    committed: 4,
    merged: 0,
    snapshotId: 'id-2',
    channel: 'channel',
  }
  const result = mergeCursor({
    log,
    collection: 'collection',
    merged,
    operation,
  })
  expect(result).toBe(log)
  expect(result).toEqual(log)
  expect(result.length).toBe(1)
})
it('is idempotant', () => {
  const log: YobtaServerLogItem[] = [
    {
      type: YOBTA_COLLECTION_INSERT,
      operationId: 'op-id-1',
      snapshotId: 'id-1',
      collection: 'collection',
      committed: 2,
      channel: 'channel',
      merged: 3,
      nextSnapshotId: undefined,
    },
  ]
  mergeCursor({
    log,
    collection: 'collection',
    merged,
    operation: {
      id: 'op-id-2',
      type: YOBTA_COLLECTION_INSERT,
      data: {
        id: 'id-1',
        name: 'john',
      },
      committed: 1,
      merged: 0,
      snapshotId: 'id-1',
      channel: 'channel',
    },
  })
  mergeCursor({
    log,
    collection: 'collection',
    merged,
    operation: {
      id: 'op-id-3',
      type: YOBTA_COLLECTION_INSERT,
      data: {
        id: 'id-1',
        name: 'john',
      },
      committed: 2,
      merged: 0,
      snapshotId: 'id-1',
      channel: 'channel',
    },
  })
  const result = mergeCursor({
    log,
    collection: 'collection',
    merged,
    operation: {
      id: 'op-id-4',
      type: YOBTA_COLLECTION_INSERT,
      data: {
        id: 'id-1',
        name: 'john',
      },
      committed: 4,
      merged: 0,
      snapshotId: 'id-1',
      channel: 'channel',
    },
  })
  expect(result).toEqual([
    {
      type: YOBTA_COLLECTION_INSERT,
      operationId: 'op-id-1',
      snapshotId: 'id-1',
      collection: 'collection',
      channel: 'channel',
      committed: 2,
      merged: 3,
      nextSnapshotId: undefined,
    },
  ])
})
