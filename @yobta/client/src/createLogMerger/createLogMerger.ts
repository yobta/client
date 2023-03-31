import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_REJECT,
} from '@yobta/protocol'
import { findLastIndex } from '@yobta/utils'

import { YobtaGetCollectionSnapshot } from '../createCollection/createCollection.js'
import { YobtaClientLogOperation } from '../createClientLog/createClientLog.js'

interface YobtaLogMergerFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    getSnapshot: YobtaGetCollectionSnapshot<Snapshot>,
  ): (operations: YobtaClientLogOperation<Snapshot>[]) => Snapshot[]
}

const insert = <Snapshot extends YobtaCollectionAnySnapshot>(
  snapshots: Snapshot[],
  snapshot?: Snapshot,
  nextSnapshotId?: YobtaCollectionId,
): Snapshot[] => {
  if (!snapshot || snapshot.id === nextSnapshotId) {
    return snapshots
  }
  // todo: find last index
  const index = nextSnapshotId
    ? findLastIndex(snapshots, ({ id }) => id === nextSnapshotId)
    : -1
  if (index === -1) {
    snapshots.push(snapshot)
    return snapshots
  }
  return [...snapshots.slice(0, index), snapshot, ...snapshots.slice(index)]
}

export const createLogMerger: YobtaLogMergerFactory =
  <Snapshot extends YobtaCollectionAnySnapshot>(
    getSnapshot: YobtaGetCollectionSnapshot<Snapshot>,
  ) =>
  (operations: YobtaClientLogOperation<Snapshot>[]): Snapshot[] => {
    const deleted = new Map<YobtaCollectionId, number>()
    const getCount = (id: YobtaCollectionId): number => deleted.get(id) || 0
    const setCount = (id: YobtaCollectionId, count: number): void => {
      deleted.set(id, getCount(id) + count)
    }
    const mergeResult = operations
      .reduce<YobtaClientLogOperation<Snapshot>[]>((acc, operation) => {
        switch (operation.type) {
          case YOBTA_REJECT:
            return acc.filter(({ id }) => id !== operation.operationId)
          case YOBTA_COLLECTION_DELETE:
            setCount(operation.snapshotId, 1)
            return acc
          case YOBTA_COLLECTION_RESTORE:
            deleted.delete(operation.snapshotId)
            return acc
          default:
            acc.push(operation)
            return acc
        }
      }, [])
      .reduce<Snapshot[]>((acc, { type, snapshotId, nextSnapshotId }) => {
        switch (type) {
          case YOBTA_COLLECTION_INSERT:
          case YOBTA_COLLECTION_REVALIDATE: {
            const snapshot = getSnapshot(snapshotId)
            return insert(acc, snapshot, nextSnapshotId)
          }
          case YOBTA_COLLECTION_MOVE: {
            const nextAcc = acc.filter(({ id }) => id !== snapshotId)
            if (
              nextAcc.length === acc.length ||
              snapshotId === nextSnapshotId
            ) {
              return acc
            }
            const snapshot = getSnapshot(snapshotId)
            return insert(nextAcc, snapshot, nextSnapshotId)
          }
          case YOBTA_REJECT: {
            return acc
          }
          default: {
            throw new Error('Unexpected type')
          }
        }
      }, [])
      .filter(snapshot => {
        if (getCount(snapshot.id) > 0) {
          setCount(snapshot.id, -1)
          return false
        }
        return true
      })
    return mergeResult
  }
