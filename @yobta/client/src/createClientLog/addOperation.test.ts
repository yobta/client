import {
  YobtaCollectionDeleteOperation,
  YobtaCollectionInsertOperation,
  YobtaCollectionMoveOperation,
  YobtaCollectionRestoreOperation,
  YobtaRejectOperation,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { addOperation } from './addOperation.js'

type Snapshot = {
  id: string
}

it('supports insert', () => {
  const log: any = []
  const insertOperation: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const shouldUpdate = addOperation(log, insertOperation)
  expect(log).toEqual([insertOperation])
  expect(shouldUpdate).toBe(true)
})
it('supports reject', () => {
  const log: any = []
  const rejectOperation: YobtaRejectOperation = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_REJECT,
    operationId: 'operation-2',
    reason: 'reason',
  }
  const shouldUpdate = addOperation(log, rejectOperation)
  expect(log).toEqual([rejectOperation])
  expect(shouldUpdate).toBe(true)
})
it('supports move', () => {
  const log: any = []
  const moveOperation: YobtaCollectionMoveOperation = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_MOVE,
    snapshotId: 'snapshot-1',
    nextSnapshotId: 'snapshot-2',
  }
  const shouldUpdate = addOperation(log, moveOperation)
  expect(log).toEqual([moveOperation])
  expect(shouldUpdate).toBe(true)
})
it('supports delete', () => {
  const log: any = []
  const deleteOperation: YobtaCollectionDeleteOperation = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_DELETE,
    snapshotId: 'snapshot-1',
  }
  const shouldUpdate = addOperation(log, deleteOperation)
  expect(log).toEqual([deleteOperation])
  expect(shouldUpdate).toBe(true)
})
it('supports restore', () => {
  const log: any = []
  const restoreOperation: YobtaCollectionRestoreOperation = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 1,
    type: YOBTA_COLLECTION_RESTORE,
    snapshotId: 'snapshot-1',
  }
  const shouldUpdate = addOperation(log, restoreOperation)
  expect(log).toEqual([restoreOperation])
  expect(shouldUpdate).toBe(true)
})
it('sorts a:1, b:2', () => {
  const insertA: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const insertB: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-2',
    channel: 'channel',
    committed: 2,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-2',
    },
    snapshotId: 'snapshot-2',
  }
  const log: any = [insertA]
  const shouldUpdate = addOperation(log, insertB)
  expect(log).toEqual([insertA, insertB])
  expect(shouldUpdate).toBe(true)
})
it('sorts a:1, b:1', () => {
  const insertA: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const insertB: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-2',
    channel: 'channel',
    committed: 1,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-2',
    },
    snapshotId: 'snapshot-2',
  }
  const log: any = [insertA]
  const shouldUpdate = addOperation(log, insertB)
  expect(log).toEqual([insertA, insertB])
  expect(shouldUpdate).toBe(true)
})
it('sorts a:2, b:1', () => {
  const insertA: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 2,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const insertB: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-2',
    channel: 'channel',
    committed: 1,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-2',
    },
    snapshotId: 'snapshot-2',
  }
  const log: any = [insertA]
  const shouldUpdate = addOperation(log, insertB)
  expect(log).toEqual([insertB, insertA])
  expect(shouldUpdate).toBe(true)
})
it('resolves a:1, a:2', () => {
  const insertA1: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const insertA2: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 2,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const log: any = [insertA1]
  const shouldUpdate = addOperation(log, insertA2)
  expect(log).toEqual([insertA2])
  expect(shouldUpdate).toBe(true)
})
it('resolves a:1, a:1', () => {
  const insertA1: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const insertA2: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 1,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const log: any = [insertA1]
  const shouldUpdate = addOperation(log, insertA2)
  expect(log).toEqual([insertA2])
  expect(shouldUpdate).toBe(true)
})
it('resolves a:m1, a:m0', () => {
  const insertA1: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 2,
    merged: 3,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const insertA2: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 2,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const insertA3: YobtaCollectionInsertOperation<Snapshot> = {
    id: 'operation-1',
    channel: 'channel',
    committed: 4,
    merged: 0,
    type: YOBTA_COLLECTION_INSERT,
    data: {
      id: 'snapshot-1',
    },
    snapshotId: 'snapshot-1',
  }
  const log: any = [insertA1]
  const shouldUpdate1 = addOperation(log, insertA2)
  const shouldUpdate2 = addOperation(log, insertA3)
  expect(log).toEqual([insertA1])
  expect(shouldUpdate1).toBe(false)
  expect(shouldUpdate2).toBe(false)
})
