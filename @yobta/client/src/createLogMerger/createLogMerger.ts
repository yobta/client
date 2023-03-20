import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { YobtaGetCollectionSnapshot } from '../createCollection/createCollection.js'
import { YobtaLogEntry } from '../createLog/createLog.js'

interface YobtaLogMergerFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    getSnapshot: YobtaGetCollectionSnapshot<Snapshot>,
  ): (entries: YobtaLogEntry[]) => Snapshot[]
}

const insert = <Snapshot extends YobtaCollectionAnySnapshot>(
  snapshots: Snapshot[],
  snapshot?: Snapshot,
  nextSnapshotId?: YobtaCollectionId,
): Snapshot[] => {
  if (!snapshot || snapshot.id === nextSnapshotId) {
    return snapshots
  }
  const index = nextSnapshotId
    ? snapshots.findIndex(({ id }) => id === nextSnapshotId)
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
  entries => {
    const deleted = new Set<YobtaCollectionId>()
    const mergeResult = entries
      .reduce<YobtaLogEntry[]>((acc, entry) => {
        switch (entry[4]) {
          case YOBTA_REJECT:
            return acc.filter(([id]) => id !== entry[7])
          case YOBTA_COLLECTION_DELETE:
            deleted.add(entry[5])
            return acc
          // case YOBTA_COLLECTION_RESTORE:
          //   deleted.delete(entry[5])
          //   return acc
          default:
            acc.push(entry)
            return acc
        }
      }, [])
      .reduce<Snapshot[]>((acc, [, , , , type, snapshotId, nextSnapshotId]) => {
        switch (type) {
          case YOBTA_COLLECTION_INSERT: {
            if (deleted.has(snapshotId)) {
              deleted.delete(snapshotId)
              return acc
            }
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
    return mergeResult
  }
