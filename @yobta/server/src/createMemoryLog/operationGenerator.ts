import {
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YobtaBatchedOperation,
  YobtaCollectionAnySnapshot,
  YOBTA_CHANNEL_INSERT,
  YobtaCollectionId,
  YobtaServerLogItem,
} from '@yobta/protocol'

import { revalidate } from './revalidate.js'

const typesFilter = new Set([
  YOBTA_CHANNEL_INSERT,
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
])

export async function* operationGenerator<
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  channel,
  minMerged,
  log,
}: {
  channel: string
  minMerged: number
  log: YobtaServerLogItem[]
}): AsyncGenerator<YobtaBatchedOperation<Snapshot>> {
  const matchedEntries = log
    .filter(
      entry =>
        entry.channel === channel &&
        entry.merged > minMerged &&
        typesFilter.has(entry.type),
    )
    .sort((a, b): number => a.committed - b.committed)

  const snapshotIds = new Set<YobtaCollectionId>()

  for (const entry of matchedEntries) {
    if (
      entry.type === YOBTA_CHANNEL_INSERT &&
      !snapshotIds.has(entry.snapshotId)
    ) {
      yield revalidate({ log, ...entry, channel })
      snapshotIds.add(entry.snapshotId)
    }
    const chunk = {
      id: entry.operationId,
      type: entry.type,
      channel,
      snapshotId: entry.snapshotId,
      nextSnapshotId: entry.nextSnapshotId,
      committed: entry.committed,
      merged: entry.merged,
    } as YobtaBatchedOperation<Snapshot>
    yield chunk
  }
}
