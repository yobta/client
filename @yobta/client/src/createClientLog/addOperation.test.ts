import {
  YobtaCollectionCreateOperation,
  YOBTA_CHANNEL_DELETE,
  YOBTA_COLLECTION_CREATE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { addOperation } from './addOperation.js'
import { YobtaClientLogOperation } from './createClientLog.js'

type Snapshot = {
  id: string
}

describe('supports all operation types', () => {
  const operaions: YobtaClientLogOperation<Snapshot>[] = [
    {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 1,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    },
    {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 1,
      type: YOBTA_REJECT,
      operationId: 'operation-2',
      reason: 'reason',
    },
    {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 1,
      type: YOBTA_CHANNEL_SHIFT,
      snapshotId: 'snapshot-1',
      nextSnapshotId: 'snapshot-2',
    },
    {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 1,
      type: YOBTA_CHANNEL_DELETE,
      snapshotId: 'snapshot-1',
    },
    {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 1,
      type: YOBTA_CHANNEL_RESTORE,
      snapshotId: 'snapshot-1',
    },
  ]
  operaions.forEach(operation => {
    it(`supports ${operation.type}`, () => {
      const log: any = []
      const shouldUpdate = addOperation(log, operation, false)
      expect(log).toEqual([operation])
      expect(shouldUpdate).toBe(true)
    })
  })
})

describe('additions', () => {
  it('sorts ac:1, bc:2', () => {
    const insertA: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const insertB: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-2',
      channel: 'channel',
      committed: 2,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-2',
      },
    }
    const log: any = [insertA]
    const shouldUpdate = addOperation(log, insertB, false)
    expect(log).toEqual([insertA, insertB])
    expect(shouldUpdate).toBe(true)
  })
  it('sorts ac:1, bc:1', () => {
    const insertA: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const insertB: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-2',
      channel: 'channel',
      committed: 1,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-2',
      },
    }
    const log: any = [insertA]
    const shouldUpdate = addOperation(log, insertB, false)
    expect(log).toEqual([insertA, insertB])
    expect(shouldUpdate).toBe(true)
  })
})

describe('insertions', () => {
  it('sorts ac:2, bc:1', () => {
    const insertA: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 2,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const insertB: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-2',
      channel: 'channel',
      committed: 1,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-2',
      },
    }
    const log: any = [insertA]
    const shouldUpdate = addOperation(log, insertB, false)
    expect(log).toEqual([insertB, insertA])
    expect(shouldUpdate).toBe(true)
  })
  it('sorts ac:1, bc:1', () => {
    const insertA: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const insertB: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-2',
      channel: 'channel',
      committed: 2,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-2',
      },
    }
    const log: any = [insertA]
    const shouldUpdate = addOperation(log, insertB, false)
    expect(log).toEqual([insertA, insertB])
    expect(shouldUpdate).toBe(true)
  })
})

describe('conflicts', () => {
  it('resolves ac:1, ac:2', () => {
    const insertA1: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const insertA2: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 2,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const log: any = [insertA1]
    const shouldUpdate = addOperation(log, insertA2, true)
    expect(log).toEqual([insertA1])
    expect(shouldUpdate).toBe(false)
  })
  it('resolves ac:1, am:0', () => {
    const insertA1: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const insertA2: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const log: any = [insertA1]
    const shouldUpdate = addOperation(log, insertA2, true)
    expect(log).toEqual([insertA1])
    expect(shouldUpdate).toBe(false)
  })
  it('resolves ac:1, am:1', () => {
    const insertA1: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const insertA2: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 1,
      merged: 2,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const log: any = [insertA1]
    const shouldUpdate = addOperation(log, insertA2, true)
    expect(log).toEqual([insertA2])
    expect(shouldUpdate).toBe(true)
  })
  it('resolves am:1, am:0', () => {
    const insertA1: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 2,
      merged: 3,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const insertA2: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 3,
      merged: 0,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const log: any = [insertA1]
    const shouldUpdate = addOperation(log, insertA2, true)
    expect(log).toEqual([insertA1])
    expect(shouldUpdate).toBe(false)
  })
  it('resolves am:1, am:2', () => {
    const insertA1: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 2,
      merged: 3,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const insertA2: YobtaCollectionCreateOperation<Snapshot> = {
      id: 'operation-1',
      channel: 'channel',
      committed: 3,
      merged: 4,
      type: YOBTA_COLLECTION_CREATE,
      data: {
        id: 'snapshot-1',
      },
    }
    const log: any = [insertA1]
    const shouldUpdate = addOperation(log, insertA2, true)
    expect(log).toEqual([insertA1])
    expect(shouldUpdate).toBe(false)
  })
})
