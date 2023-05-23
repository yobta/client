import { Readable } from 'stream'
import { YobtaJsonValue } from '@yobta/stores'

import {
  YOBTA_COLLECTION_REVALIDATE,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionOperation,
} from './collection.js'
import {
  YobtaBatchedOperation,
  YobtaServerDataOperation,
} from './serverOperations.js'
import {
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_INSERT,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
} from './channel.js'

export type YobtaServerLog<
  SupportedSnapshotsUnion extends YobtaCollectionAnySnapshot,
> = {
  find<Snapshot extends SupportedSnapshotsUnion>(
    channel: string,
    merged: number,
    chunkSize: number,
  ): YobtaServerLogStream<Snapshot>
  merge<Snapshot extends SupportedSnapshotsUnion>(
    collection: string,
    operation: YobtaCollectionOperation<Snapshot>,
  ): Promise<YobtaServerDataOperation<Snapshot>>
  observe<Snapshot extends SupportedSnapshotsUnion>(
    observer: (operation: YobtaCollectionOperation<Snapshot>) => void,
  ): VoidFunction
}

export type YobtaServerLogStream<Snapshot extends YobtaCollectionAnySnapshot> =
  Readable & AsyncIterable<YobtaBatchedOperation<Snapshot>[]>

export type YobtaServerLogRevalidateEntry = {
  type: typeof YOBTA_COLLECTION_REVALIDATE
  operationId: string
  collection: string
  channel?: never
  snapshotId: YobtaCollectionId
  nextSnapshotId?: never
  committed: number
  merged: number
  key: string
  value: YobtaJsonValue | undefined
}
export type YobtaServerLogChannelInsertEntry = {
  type: typeof YOBTA_CHANNEL_INSERT
  operationId: string
  collection: string
  channel: string
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  committed: number
  merged: number
  key?: never
  value?: never
}
export type YobtaServerLogChannelDeleteEntry = {
  type: typeof YOBTA_CHANNEL_DELETE
  operationId: string
  collection: string
  channel: string
  snapshotId: YobtaCollectionId
  nextSnapshotId?: never
  committed: number
  merged: number
  key?: never
  value?: never
}
export type YobtaServerLogChannelRestoreEntry = {
  type: typeof YOBTA_CHANNEL_RESTORE
  operationId: string
  collection: string
  channel: string
  snapshotId: YobtaCollectionId
  nextSnapshotId?: never
  committed: number
  merged: number
  key?: never
  value?: never
}
export type YobtaServerLogChannelMoveEntry = {
  type: typeof YOBTA_CHANNEL_SHIFT
  operationId: string
  collection: string
  channel: string
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  committed: number
  merged: number
  key?: never
  value?: never
}
export type YobtaServerLogItem =
  | YobtaServerLogRevalidateEntry
  | YobtaServerLogChannelInsertEntry
  | YobtaServerLogChannelDeleteEntry
  | YobtaServerLogChannelRestoreEntry
  | YobtaServerLogChannelMoveEntry
