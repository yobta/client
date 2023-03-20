import {
  YobtaCollectionId,
  YobtaOperationId,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { YobtaLogEntry } from '../createLog/createLog.js'

interface YobtaParseLogEntry {
  (entry: YobtaLogEntry): YobtaParsedLogEntry
}

type YobtaParsedLogEntry =
  | {
      id: YobtaOperationId
      channel: string
      committed: number
      merged: number
      type: typeof YOBTA_COLLECTION_INSERT
      snapshotId: YobtaCollectionId
      nextSnapshotId: YobtaCollectionId | undefined
      operationId: undefined
    }
  | {
      id: YobtaOperationId
      channel: string
      committed: number
      merged: number
      type: typeof YOBTA_REJECT
      snapshotId: undefined
      nextSnapshotId: undefined
      operationId: YobtaOperationId
    }
  | {
      id: YobtaOperationId
      channel: string
      committed: number
      merged: number
      type: typeof YOBTA_COLLECTION_MOVE
      snapshotId: YobtaCollectionId
      nextSnapshotId: YobtaCollectionId
      operationId: undefined
    }
  | {
      id: YobtaOperationId
      channel: string
      committed: number
      merged: number
      type: typeof YOBTA_COLLECTION_DELETE
      snapshotId: YobtaCollectionId
      nextSnapshotId: undefined
      operationId: undefined
    }

export const parseLogEntry: YobtaParseLogEntry = ([
  id,
  channel,
  committed,
  merged,
  type,
  snapshotId,
  nextSnapshotId,
  operationId,
]) => {
  switch (type) {
    case YOBTA_COLLECTION_INSERT:
      return {
        id,
        channel,
        committed,
        merged,
        type,
        snapshotId,
        nextSnapshotId,
        operationId: undefined,
      }
    case YOBTA_REJECT:
      return {
        id,
        channel,
        committed,
        merged,
        type,
        snapshotId: undefined,
        nextSnapshotId: undefined,
        operationId,
      }
    case YOBTA_COLLECTION_MOVE:
      return {
        id,
        channel,
        committed,
        merged,
        type,
        snapshotId,
        nextSnapshotId,
        operationId: undefined,
      }
    case YOBTA_COLLECTION_DELETE:
      return {
        id,
        channel,
        committed,
        merged,
        type,
        snapshotId,
        nextSnapshotId: undefined,
        operationId: undefined,
      }
    default:
      throw new Error(`Unknown operation type: ${type}`)
  }
}
