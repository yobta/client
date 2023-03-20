import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
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
  entries =>
    entries
      .reduce<YobtaLogEntry[]>((acc, entry) => {
        if (entry[4] === YOBTA_REJECT) {
          return acc.filter(([id]) => id !== entry[7])
        }
        acc.push(entry)
        return acc
      }, [])
      .reduce<Snapshot[]>((acc, [, , , , type, snapshotId, nextSnapshotId]) => {
        switch (type) {
          case YOBTA_COLLECTION_INSERT: {
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
