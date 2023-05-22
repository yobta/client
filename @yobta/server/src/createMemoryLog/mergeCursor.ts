import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_CHANNEL_INSERT,
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
  type: typeof YOBTA_CHANNEL_INSERT
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
    case YOBTA_CHANNEL_INSERT:
    case YOBTA_CHANNEL_DELETE:
    case YOBTA_CHANNEL_RESTORE:
    case YOBTA_CHANNEL_SHIFT:
      break
    default:
      return log
  }
  const shouldPush = !log.some(entry => entry.operationId === operation.id)
  if (shouldPush) {
    switch (operation.type) {
      case YOBTA_CHANNEL_INSERT:
        log.push({
          type: YOBTA_CHANNEL_INSERT,
          operationId: operation.id,
          collection,
          channel: operation.channel,
          snapshotId: operation.snapshotId,
          nextSnapshotId: operation.nextSnapshotId,
          committed: operation.committed,
          merged,
        })
        break
      case YOBTA_CHANNEL_DELETE:
        log.push({
          type: YOBTA_CHANNEL_DELETE,
          operationId: operation.id,
          collection,
          channel: operation.channel,
          snapshotId: operation.snapshotId,
          committed: operation.committed,
          merged,
        })
        break
      case YOBTA_CHANNEL_RESTORE:
        log.push({
          type: YOBTA_CHANNEL_RESTORE,
          operationId: operation.id,
          collection,
          channel: operation.channel,
          snapshotId: operation.snapshotId,
          committed: operation.committed,
          merged,
        })
        break
      case YOBTA_CHANNEL_SHIFT:
        log.push({
          type: YOBTA_CHANNEL_SHIFT,
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
