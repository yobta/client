import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionTuple,
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

export type YobtaServerLogEntry = {
  snapshotId: YobtaCollectionId
  collection: string
  committed: number
  channel?: never
  merged: number
  key: string
  value: YobtaJsonValue | undefined
}
export type YobtaChannelLogCursor = {
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  collection: string
  channel: string
  committed: number
  merged: number
  deleted: boolean
}
export type YobtaServerLogItem = YobtaServerLogEntry | YobtaChannelLogCursor
// #endregion

export const createMemoryLog: YobtaMemoryLogFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>() => {
  let log: YobtaServerLogItem[] = []
  const { observe, next } =
    createObservable<YobtaClientDataOperation<Snapshot>>()
  const find: YobtaLog<Snapshot>['find'] = async (channel, minMerged) => {
    const cursors = log.filter(
      entry =>
        'channel' in entry &&
        entry.channel === channel &&
        entry.merged > minMerged,
    ) as YobtaChannelLogCursor[]
    return cursors.map(entry => {
      const snapshots = log.filter(
        ({ snapshotId }) => snapshotId === entry.snapshotId && 'key' in entry,
      ) as YobtaServerLogEntry[]
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
          deleted: entry.deleted,
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
    const withData = mergeData(log, collection, operation)
    log = mergeCursor(withData, collection, operation)
    next(operation)
    return operation
  }
  return {
    find,
    merge,
    observe,
  }
}
