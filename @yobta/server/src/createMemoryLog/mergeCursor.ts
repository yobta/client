import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_SHIFT,
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
// #endregion

export const mergeCursor: YobtaServerLogMergeToChannel = ({
  collection,
  log,
  merged,
  operation,
}) => {
  switch (operation.type) {
    case YOBTA_COLLECTION_INSERT:
    case YOBTA_COLLECTION_DELETE:
    case YOBTA_COLLECTION_RESTORE:
    case YOBTA_COLLECTION_SHIFT:
      break
    default:
      return log
  }
  const shouldPush = !log.some(
    entry =>
      (entry.operationId === operation.id &&
        operation.type !== YOBTA_COLLECTION_INSERT) ||
      (entry.type === YOBTA_COLLECTION_INSERT &&
        entry.snapshotId === operation.snapshotId &&
        entry.type === operation.type &&
        entry.channel === operation.channel),
  )
  if (shouldPush) {
    switch (operation.type) {
      case YOBTA_COLLECTION_INSERT:
        log.push({
          type: YOBTA_COLLECTION_INSERT,
          operationId: operation.id,
          collection,
          channel: operation.channel,
          snapshotId: operation.snapshotId,
          nextSnapshotId: operation.nextSnapshotId,
          committed: operation.committed,
          merged,
        })
        break
      case YOBTA_COLLECTION_DELETE:
        log.push({
          type: YOBTA_COLLECTION_DELETE,
          operationId: operation.id,
          collection,
          channel: operation.channel,
          snapshotId: operation.snapshotId,
          committed: operation.committed,
          merged,
        })
        break
      case YOBTA_COLLECTION_RESTORE:
        log.push({
          type: YOBTA_COLLECTION_RESTORE,
          operationId: operation.id,
          collection,
          channel: operation.channel,
          snapshotId: operation.snapshotId,
          committed: operation.committed,
          merged,
        })
        break
      case YOBTA_COLLECTION_SHIFT:
        log.push({
          type: YOBTA_COLLECTION_SHIFT,
          operationId: operation.id,
          collection,
          channel: operation.channel,
          snapshotId: operation.snapshotId,
          nextSnapshotId: operation.nextSnapshotId,
          committed: operation.committed,
          merged,
        })
        break
    }
  }
  return log
}
