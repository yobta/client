import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_COLLECTION_INSERT,
} from '@yobta/protocol'

import { YobtaChannelLogCursor, YobtaServerLogItem } from './createMemoryLog.js'

// #region types
interface YobtaServerLogMergeToChannel {
  <Operation extends YobtaClientDataOperation<YobtaCollectionAnySnapshot>>(
    log: YobtaServerLogItem[],
    collection: string,
    operation: Operation,
  ): YobtaServerLogItem[]
}
export type YobtaChannelLogEntry = {
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  channel: string
  committed: number
  merged: number
  deleted: boolean
}
// #endregion

export const mergeCursor: YobtaServerLogMergeToChannel = (
  log,
  collection,
  operation,
) => {
  if (operation.type !== YOBTA_COLLECTION_INSERT) {
    return log
  }
  const head: YobtaServerLogItem[] = []
  let tail: YobtaChannelLogCursor | undefined
  for (const entry of log) {
    if (
      'channel' in entry &&
      entry.channel === operation.channel &&
      entry.snapshotId === operation.snapshotId
    ) {
      tail = entry
      break
    }
    head.push(entry)
  }
  if (!tail || tail.committed < operation.committed) {
    const entry: YobtaChannelLogCursor = {
      snapshotId: operation.snapshotId,
      nextSnapshotId: operation.nextSnapshotId,
      channel: operation.channel,
      collection,
      committed: operation.committed,
      merged: Date.now(),
      deleted: false,
    }
    head.push(entry)
  }
  return head
}
