import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YOBTA_COLLECTION_CREATE,
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
  YobtaBatchedOperation,
  YobtaCollectionOperation,
  YOBTA_CHANNEL_INSERT,
  YobtaServerDataOperation,
} from '@yobta/protocol'
import { createObservable, YobtaJsonValue } from '@yobta/stores'
import { coerceError } from '@yobta/utils'
import { Readable, ReadableOptions } from 'stream'

import { serverLogger } from '../serverLogger/serverLogger.js'
import { YobtaFilteredOperation, filterKeys } from './filterKeys.js'
import { mergeCursor } from './mergeCursor.js'
import { mergeData } from './mergeData.js'
import { operationGenerator } from './operationGenerator.js'
import { revalidate } from './revalidate.js'

// #region types
interface YobtaMemoryLogFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(): YobtaServerLog<Snapshot>
}
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
  | YobtaServerLogSnapshotEntry
  | YobtaServerLogChannelInsertEntry
  | YobtaServerLogChannelDeleteEntry
  | YobtaServerLogChannelRestoreEntry
  | YobtaServerLogChannelMoveEntry
// #endregion

export const createMemoryLog: YobtaMemoryLogFactory = <
  SupportedSnapshotsUnion extends YobtaCollectionAnySnapshot,
>() => {
  let log: YobtaServerLogItem[] = []
  const { observe, next } = createObservable()
  const find = <Snapshot extends SupportedSnapshotsUnion>(
    channel: string,
    minMerged: number,
    chunkSize: number,
  ): YobtaServerLogStream<Snapshot> => {
    const generator = operationGenerator<Snapshot>({
      channel,
      minMerged,
      log,
      chunkSize,
    })
    return Readable.from(generator, { objectMode: true })
  }
  const merge = async <Snapshot extends SupportedSnapshotsUnion>(
    collection: string,
    rawOperation: YobtaCollectionOperation<Snapshot>,
  ): Promise<YobtaServerDataOperation<Snapshot>> => {
    const merged = Date.now()
    switch (rawOperation.type) {
      case YOBTA_COLLECTION_CREATE:
      case YOBTA_COLLECTION_UPDATE: {
        if (rawOperation.type === YOBTA_COLLECTION_CREATE) {
          const existingOperation = log.find(
            entry =>
              entry.snapshotId === rawOperation.data.id &&
              entry.collection === collection &&
              entry.key === 'id',
          )
          if (existingOperation) {
            const resolution = revalidate<Snapshot>({
              log,
              operationId: rawOperation.id,
              collection,
              channel: rawOperation.channel,
              committed: existingOperation.committed,
              merged: existingOperation.merged,
              snapshotId: existingOperation.snapshotId,
            })
            return resolution
          }
        }
        const operation = filterKeys<Snapshot>(log, collection, rawOperation)
        log = mergeData({ log, collection, merged, operation })
        const mergedOperation = {
          ...operation,
          merged,
        }
        next(mergedOperation)
        serverLogger.debug(mergedOperation)
        return mergedOperation
      }
      case YOBTA_CHANNEL_INSERT:
      case YOBTA_CHANNEL_DELETE:
      case YOBTA_CHANNEL_RESTORE:
      case YOBTA_CHANNEL_SHIFT: {
        log = mergeCursor({
          log,
          collection,
          merged,
          operation: rawOperation,
        })
        const mergedOperation = { ...rawOperation, merged }
        next(mergedOperation)
        serverLogger.debug(mergedOperation)
        return mergedOperation
      }
      default: {
        const errorData = Object.assign({}, rawOperation, {
          message: `Invalid operation`,
        })
        serverLogger.error(errorData)
        throw coerceError(errorData)
      }
    }
  }
  return {
    find,
    merge,
    observe,
  }
}
