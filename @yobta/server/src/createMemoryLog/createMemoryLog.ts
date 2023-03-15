import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionTuple,
  YOBTA_COLLECTION_REVALIDATE,
} from '@yobta/protocol'
import { createStore, YobtaJsonValue } from '@yobta/stores'
import { nanoid } from 'nanoid'

import { filterKeys } from './filterKeys.js'
import { mergeCursor } from './mergeCursor.js'
import { mergeData } from './mergeData.js'

// #region types
interface YobtaMemoryLogFactory {
  (): YobtaLog
}
export type YobtaLog = {
  find(
    channel: string,
    merged: number,
  ): Promise<YobtaCollectionRevalidateOperation<YobtaCollectionAnySnapshot>[]>
  merge<Operation extends YobtaClientDataOperation<YobtaCollectionAnySnapshot>>(
    collection: string,
    operation: Operation,
  ): Promise<Operation>
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

export const createMemoryLog: YobtaMemoryLogFactory = () => {
  const { last, next } = createStore<YobtaServerLogItem[]>([])
  const find: YobtaLog['find'] = async (channel, minMerged) => {
    const operations = last()
    const cursors = operations.filter(
      entry =>
        'channel' in entry &&
        entry.channel === channel &&
        entry.merged > minMerged,
    ) as YobtaChannelLogCursor[]
    return cursors.map(entry => {
      const snapshots = operations.filter(
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
  const merge: YobtaLog['merge'] = async (collection, rawOperation) => {
    const state = last()
    const operation = filterKeys(state, collection, rawOperation)
    const withData = mergeData(state, collection, operation)
    const withCursor = mergeCursor(withData, collection, operation)
    next(withCursor, operation)
    return operation
  }
  return {
    find,
    merge,
  }
}
