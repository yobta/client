import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionTuple,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_REVALIDATE,
} from '@yobta/protocol'
import { createObservable, YobtaJsonValue } from '@yobta/stores'

import { filterKeys } from './filterKeys.js'
import { mergeCursor } from './mergeCursor.js'
import { mergeData } from './mergeData.js'

// #region types
interface YobtaMemoryLogFactory {
  <
    Snapshot extends YobtaCollectionAnySnapshot = YobtaCollectionAnySnapshot,
  >(): YobtaLog<Snapshot>
}
export type YobtaLog<Snapshot extends YobtaCollectionAnySnapshot> = {
  find(
    channel: string,
    merged: number,
  ): Promise<YobtaCollectionRevalidateOperation<YobtaCollectionAnySnapshot>[]>
  merge<Operation extends YobtaClientDataOperation<Snapshot>>(
    collection: string,
    operation: Operation,
  ): Promise<Operation>
  observe: (
    observer: (operation: YobtaClientDataOperation<Snapshot>) => void,
  ) => VoidFunction
}

export type YobtaServerLogSnapshotEntry = {
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
  type: typeof YOBTA_COLLECTION_INSERT
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
  type: typeof YOBTA_COLLECTION_DELETE
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
  type: typeof YOBTA_COLLECTION_RESTORE
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
  type: typeof YOBTA_COLLECTION_MOVE
  operationId: string
  collection: string
  channel: string
  snapshotId: YobtaCollectionId
  nextSnapshotId: YobtaCollectionId
  committed: number
  merged: number
  key?: never
  value?: never
}
export type YobtaServerLogItem =
  | YobtaServerLogSnapshotEntry
  | YobtaServerLogChannelInsertEntry
  | YobtaServerLogChannelDeleteEntry
  | YobtaServerLogChannelRestoreEntry
  | YobtaServerLogChannelMoveEntry
// #endregion

export const createMemoryLog: YobtaMemoryLogFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>() => {
  let log: YobtaServerLogItem[] = []
  const { observe, next } =
    createObservable<YobtaClientDataOperation<Snapshot>>()
  const find: YobtaLog<Snapshot>['find'] = async (channel, minMerged) => {
    const cursors = log.filter(
      entry => entry.channel === channel && entry.merged > minMerged,
    ) as YobtaServerLogChannelInsertEntry[]
    return cursors.map(entry => {
      const snapshots = log.filter(
        ({ snapshotId, type }) =>
          snapshotId === entry.snapshotId &&
          type === YOBTA_COLLECTION_REVALIDATE,
      ) as YobtaServerLogSnapshotEntry[]
      const data: YobtaCollectionTuple<YobtaCollectionAnySnapshot>[] =
        snapshots.map(({ key, value, committed, merged }) => [
          key,
          value,
          committed,
          merged,
        ])
      const operation: YobtaCollectionRevalidateOperation<YobtaCollectionAnySnapshot> =
        {
          id: `revalidate-${entry.snapshotId}`,
          type: YOBTA_COLLECTION_REVALIDATE,
          channel,
          snapshotId: entry.snapshotId,
          nextSnapshotId: entry.nextSnapshotId,
          committed: entry.committed,
          merged: entry.merged,
          data,
        }
      return operation
    })
  }
  const merge: YobtaLog<Snapshot>['merge'] = async (
    collection,
    rawOperation,
  ) => {
    const operation = filterKeys(log, collection, rawOperation)
    const merged = Date.now()
    const withData = mergeData({ log, collection, merged, operation })
    log = mergeCursor({ log: withData, collection, merged, operation })
    next(operation)
    return { ...operation, merged }
  }
  return {
    find,
    merge,
    observe,
  }
}
