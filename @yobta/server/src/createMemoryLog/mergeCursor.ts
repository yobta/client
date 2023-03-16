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
export type YobtaChannelLogIsertEntry = {
  type: typeof YOBTA_COLLECTION_INSERT
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  channel: string
  committed: number
  merged: number
}
// // #endregion

const supportedTypes = YOBTA_COLLECTION_INSERT

export const mergeCursor: YobtaServerLogMergeToChannel = (
  log,
  collection,
  operation,
) => {
  const shouldPush =
    operation.type === supportedTypes &&
    !log.some(
      entry =>
        entry.snapshotId === operation.snapshotId &&
        entry.type === supportedTypes &&
        entry.channel === operation.channel,
    )

  if (shouldPush) {
    log.push({
      type: operation.type,
      snapshotId: operation.snapshotId,
      nextSnapshotId: operation.nextSnapshotId,
      channel: operation.channel,
      collection,
      committed: operation.committed,
      merged: Date.now(),
    })
  }
  return log
}
