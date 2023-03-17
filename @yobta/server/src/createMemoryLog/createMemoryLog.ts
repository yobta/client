import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionTuple,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_REVALIDATE,
} from '@yobta/protocol'
import { createObservable, YobtaJsonValue } from '@yobta/stores'
import { nanoid } from 'nanoid'

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
  snapshotId: YobtaCollectionId
  collection: string
  committed: number
  channel?: never
  merged: number
  key: string
  value: YobtaJsonValue | undefined
}

export type YobtaChannelLogInsertEntry = {
  type: typeof YOBTA_COLLECTION_INSERT
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  channel: string
  collection: string
  committed: number
  merged: number
}
export type YobtaChannelLogDeleteEntry = {
  type: typeof YOBTA_COLLECTION_DELETE
  snapshotId: YobtaCollectionId
  nextSnapshotId?: never
  channel: string
  collection: string
  committed: number
  merged: number
}
export type YobtaChannelLogMoveEntry = {
  type: typeof YOBTA_COLLECTION_MOVE
  snapshotId: YobtaCollectionId
  nextSnapshotId: YobtaCollectionId
  channel: string
  collection: string
  committed: number
  merged: number
}
export type YobtaServerLogItem =
  | YobtaServerLogSnapshotEntry
  | YobtaChannelLogInsertEntry
  | YobtaChannelLogDeleteEntry
  | YobtaChannelLogMoveEntry
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
    ) as YobtaChannelLogInsertEntry[]
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
          id: nanoid(),
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
