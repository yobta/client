import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_COLLECTION_INSERT,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'

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
  for (const entry of log) {
    if (
      'channel' in entry &&
      entry.channel === operation.channel &&
      entry.snapshotId === operation.snapshotId
    ) {
      if (entry.committed >= operation.committed) {
        return log
      }
      break
    }
    head.push(entry)
  }
  head.push({
    snapshotId: operation.snapshotId,
    nextSnapshotId: operation.nextSnapshotId,
    channel: operation.channel,
    collection,
    committed: operation.committed,
    merged: Date.now(),
    deleted: false,
  })
  return head
}
