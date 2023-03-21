import {
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { YobtaLogEntry, YobtaLoggedOperation } from '../createLog/createLog.js'

interface YobtaCreateLogEntryFromOperation {
  (operation: YobtaLoggedOperation): YobtaLogEntry
}

export const createLogEntryFromOperation: YobtaCreateLogEntryFromOperation = ({
  id,
  channel,
  committed,
  merged,
  data,
  type,
  snapshotId,
  nextSnapshotId,
  operationId,
}) => {
  switch (type) {
    case YOBTA_COLLECTION_INSERT:
      return [
        id,
        channel,
        committed,
        merged,
        YOBTA_COLLECTION_INSERT,
        snapshotId,
        nextSnapshotId,
        undefined,
      ]
    case YOBTA_COLLECTION_REVALIDATE:
      return [
        id,
        channel,
        committed,
        data.reduce(
          (acc, [, , , nextMerged]) => Math.max(acc, nextMerged),
          merged,
        ),
        YOBTA_COLLECTION_INSERT,
        snapshotId,
        nextSnapshotId,
        undefined,
      ]
    case YOBTA_COLLECTION_MOVE:
      return [
        id,
        channel,
        committed,
        merged,
        YOBTA_COLLECTION_MOVE,
        snapshotId,
        nextSnapshotId,
        undefined,
      ]
    case YOBTA_COLLECTION_DELETE:
    case YOBTA_COLLECTION_RESTORE:
      return [
        id,
        channel,
        committed,
        merged,
        type,
        snapshotId,
        undefined,
        undefined,
      ]
    case YOBTA_REJECT:
      return [
        id,
        channel,
        committed,
        merged,
        YOBTA_REJECT,
        undefined,
        undefined,
        operationId,
      ]
    default:
      throw new Error(`Unknown operation type: ${type}`)
  }
}
