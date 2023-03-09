import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_COLLECTION_INSERT,
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
  if (!snapshot) {
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
    const undone = new Set<YobtaCollectionId>()
    return entries
      .reduce<YobtaLogEntry[]>((acc, entry) => {
        switch (entry[4]) {
          case YOBTA_REJECT:
            undone.add(entry[7])
            return acc
          default:
            acc.push(entry)
            return acc
        }
      }, [])
      .reduce<Snapshot[]>(
        (acc, [id, , , , type, snapshotId, nextSnapshotId]) => {
          if (type === YOBTA_COLLECTION_INSERT && !undone.has(id)) {
            const snapshot = getSnapshot(snapshotId)
            return insert(acc, snapshot, nextSnapshotId)
          }
          return acc
        },
        [],
      )
  }
