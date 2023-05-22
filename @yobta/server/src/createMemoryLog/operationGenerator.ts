import {
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YobtaBatchedOperation,
  YobtaCollectionAnySnapshot,
  YOBTA_CHANNEL_INSERT,
  YobtaCollectionId,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'
import { chunkBySize } from './chunkBySize.js'
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
  chunkSize,
}: {
  channel: string
  minMerged: number
  log: YobtaServerLogItem[]
  chunkSize: number
}): AsyncGenerator<YobtaBatchedOperation<Snapshot>[]> {
  const matchedEntries = log
    .filter(
      entry =>
        entry.channel === channel &&
        entry.merged > minMerged &&
        typesFilter.has(entry.type),
    )
    .sort((a, b): number => a.committed - b.committed)

  const snapshotIds = new Set<YobtaCollectionId>()
  const result: YobtaBatchedOperation<Snapshot>[] = []

  for (const entry of matchedEntries) {
    if (
      entry.type === YOBTA_CHANNEL_INSERT &&
      !snapshotIds.has(entry.snapshotId)
    ) {
      result.push(revalidate({ log, ...entry, channel }))
      snapshotIds.add(entry.snapshotId)
    }
    result.push({
      id: entry.operationId,
      type: entry.type,
      channel,
      snapshotId: entry.snapshotId,
      nextSnapshotId: entry.nextSnapshotId,
      committed: entry.committed,
      merged: entry.merged,
    } as YobtaBatchedOperation<Snapshot>)
  }

  const chunks = chunkBySize(result, chunkSize)

  for (const chunk of chunks) {
    yield chunk
  }
}
