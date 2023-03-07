import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_COLLECTION_INSERT,
  YOBTA_MERGE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { YobtaGetCollectionSnapshot } from '../createCollection/createCollection.js'
import {
  YobtaLogEntry,
  YobtaLogInsertEntry,
  YobtaLogMergeEntry,
} from '../createLog/createLog.js'
import { parseLogEntry } from '../parseLogEntry/parseLogEntry.js'

interface YobtaLogMergerFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    getSnapshot: YobtaGetCollectionSnapshot<Snapshot>,
  ): (entries: YobtaLogEntry[]) => Snapshot[]
}

const merge = (
  entries: YobtaLogEntry[],
  entry: YobtaLogMergeEntry,
): YobtaLogEntry[] => {
  const { committed, merged, operationId } = parseLogEntry(entry)
  const entryIndex = entries.findIndex(([id]) => id === operationId)
  if (entryIndex === -1) {
    return entries
  }
  const [id, channel, , , type, snapshotId, nextSnapshotId] = entries[
    entryIndex
  ] as YobtaLogInsertEntry
  return [
    ...entries.slice(0, entryIndex),
    ...entries.slice(entryIndex + 1),
    [
      id,
      channel,
      committed,
      merged,
      type,
      snapshotId,
      nextSnapshotId,
      undefined,
    ],
  ]
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
          case YOBTA_MERGE:
            return merge(acc, entry)
          default:
            acc.push(entry)
            return acc
        }
      }, [])
      .filter(([id]) => !undone.has(id))
      .reduce<Snapshot[]>((acc, [, , , , type, snapshotId, nextSnapshotId]) => {
        if (type === YOBTA_COLLECTION_INSERT) {
          const snapshot = getSnapshot(snapshotId)
          return insert(acc, snapshot, nextSnapshotId)
        }
        return acc
      }, [])
  }
