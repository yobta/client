import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_CHANNEL_DELETE,
  YOBTA_COLLECTION_CREATE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_REJECT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'
import { findLastIndex } from '@yobta/utils'

import { YobtaClientLogOperation } from '../createClientLog/createClientLog.js'

interface YobtaLogMergerFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    getSnapshot: YobtaGetCollectionSnapshot<Snapshot>,
  ): (operations: YobtaClientLogOperation<Snapshot>[]) => Snapshot[]
}

type YobtaGetCollectionSnapshot<Snapshot extends YobtaCollectionAnySnapshot> = (
  id: YobtaCollectionId,
) => Readonly<Snapshot> | undefined

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
          case YOBTA_CHANNEL_DELETE:
            setCount(operation.snapshotId, 1)
            return acc
          case YOBTA_CHANNEL_RESTORE:
            deleted.delete(operation.snapshotId)
            return acc
          case YOBTA_COLLECTION_UPDATE:
            return acc
          default:
            acc.push(operation)
            return acc
        }
      }, [])
      .reduce<Snapshot[]>((acc, { type, data, snapshotId, nextSnapshotId }) => {
        switch (type) {
          case YOBTA_COLLECTION_CREATE: {
            const snapshot = getSnapshot(data.id)
            return insert(acc, snapshot, nextSnapshotId)
          }
          case YOBTA_COLLECTION_REVALIDATE: {
            const snapshot = getSnapshot(snapshotId)
            return insert(acc, snapshot, nextSnapshotId)
          }
          case YOBTA_CHANNEL_SHIFT: {
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
