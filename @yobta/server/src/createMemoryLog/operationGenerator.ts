import {
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YobtaBatchedOperation,
  YobtaCollectionAnySnapshot,
  YOBTA_CHANNEL_INSERT,
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
    .map(entry => {
      switch (entry.type) {
        case YOBTA_CHANNEL_INSERT: {
          return revalidate({ log, ...entry, channel })
        }
        case YOBTA_CHANNEL_SHIFT: {
          return {
            id: entry.operationId,
            type: YOBTA_CHANNEL_SHIFT,
            channel,
            snapshotId: entry.snapshotId,
            nextSnapshotId: entry.nextSnapshotId,
            committed: entry.committed,
            merged: entry.merged,
          }
        }
        default: {
          return {
            id: entry.operationId,
            type: entry.type,
            channel,
            snapshotId: entry.snapshotId,
            nextSnapshotId: entry.nextSnapshotId,
            committed: entry.committed,
            merged: entry.merged,
          }
        }
      }
    }) as YobtaBatchedOperation<Snapshot>[]
  const chunks = chunkBySize(matchedEntries, chunkSize)
  for (const chunk of chunks) {
    yield chunk
  }
}
