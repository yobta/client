import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_COLLECTION_INSERT,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'

// #region types
interface YobtaServerLogMergeToChannel {
  <
    Operation extends YobtaClientDataOperation<YobtaCollectionAnySnapshot>,
  >(props: {
    collection: string
    log: YobtaServerLogItem[]
    merged: number
    operation: Operation
  }): YobtaServerLogItem[]
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

export const mergeCursor: YobtaServerLogMergeToChannel = ({
  collection,
  log,
  merged,
  operation,
}) => {
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
      merged,
    })
  }
  return log
}
