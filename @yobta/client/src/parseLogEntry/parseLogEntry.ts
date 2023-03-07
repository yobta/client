import {
  YobtaCollectionId,
  YobtaOperationId,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_MERGE,
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
      type: typeof YOBTA_COLLECTION_UPDATE
      snapshotId: YobtaCollectionId
      nextSnapshotId: undefined
      operationId: undefined
    }
  | {
      id: YobtaOperationId
      channel: string
      committed: number
      merged: number
      type: typeof YOBTA_MERGE
      snapshotId: undefined
      nextSnapshotId: undefined
      operationId: YobtaOperationId
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

export const parseLogEntry: YobtaParseLogEntry = ([
  id,
  channel,
  committed,
  merged,
  type,
  snapshotId,
  nextSnapshotId,
  operationId,
]) =>
  ({
    id,
    channel,
    committed,
    merged,
    type,
    snapshotId,
    nextSnapshotId,
    operationId,
  } as YobtaParsedLogEntry)
