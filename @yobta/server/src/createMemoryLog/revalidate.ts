import {
  YOBTA_COLLECTION_REVALIDATE,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionTuple,
} from '@yobta/protocol'

import {
  YobtaServerLogItem,
  YobtaServerLogSnapshotEntry,
} from './createMemoryLog.js'

export const revalidate = <Snapshot extends YobtaCollectionAnySnapshot>({
  log,
  collection,
  channel,
  committed,
  merged,
  snapshotId,
}: {
  log: YobtaServerLogItem[]
  operationId: string
  collection: string
  channel: string
  committed: number
  merged: number
  snapshotId: YobtaCollectionId
}): YobtaCollectionRevalidateOperation<Snapshot> => {
  const snapshots = log
    .filter(
      entry =>
        collection === entry.collection &&
        snapshotId === entry.snapshotId &&
        entry.type === YOBTA_COLLECTION_REVALIDATE,
    )
    .sort(
      (a, b): number => a.committed - b.committed,
    ) as YobtaServerLogSnapshotEntry[]
  const data = snapshots.map(
    ({ key, value, committed: c, merged: m }) =>
      [key, value, c, m] as YobtaCollectionTuple<Snapshot>,
  )
  return {
    id: `r-${snapshotId}`,
    type: YOBTA_COLLECTION_REVALIDATE,
    channel,
    snapshotId,
    committed,
    merged,
    data,
  }
}
