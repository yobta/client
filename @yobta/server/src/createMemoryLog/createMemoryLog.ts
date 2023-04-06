import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionTuple,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_REVALIDATE,
  YobtaCollectionMoveOperation,
  YOBTA_COLLECTION_UPDATE,
  YobtaBatchedOperation,
  YobtaCollectionOperation,
} from '@yobta/protocol'
import { createObservable, YobtaJsonValue } from '@yobta/stores'
import { coerceError } from '@yobta/utils'
import { Readable, ReadableOptions } from 'stream'

import { serverLogger } from '../serverLogger/serverLogger.js'
import { filterKeys } from './filterKeys.js'
import { mergeCursor } from './mergeCursor.js'
import { mergeData } from './mergeData.js'

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
  ): Promise<YobtaCollectionOperation<Snapshot>>
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

type YobtaChannelEntry =
  | YobtaServerLogChannelInsertEntry
  | YobtaServerLogChannelDeleteEntry
  | YobtaServerLogChannelRestoreEntry
  | YobtaServerLogChannelMoveEntry
// #endregion

const typesFilter = new Set([
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_MOVE,
])

const byCommitted = (a: YobtaServerLogItem, b: YobtaServerLogItem): number =>
  a.committed - b.committed

async function* operationGenerator<
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  channel,
  minMerged,
  log,
  chunkSize,
}: {
  channel: string
  minMerged: number
  log: YobtaServerLogItem[]
  chunkSize: number
}): AsyncGenerator<YobtaBatchedOperation<Snapshot>[]> {
  const matchedEntries = log
    .filter(
      entry =>
        entry.channel === channel &&
        entry.merged > minMerged &&
        typesFilter.has(entry.type),
    )
    .sort(byCommitted) as YobtaChannelEntry[]

  let index = 0
  while (index < matchedEntries.length) {
    const batch: YobtaBatchedOperation<Snapshot>[] = []
    for (
      let count = 0;
      count < chunkSize && index < matchedEntries.length;
      count++, index++
    ) {
      const entry = matchedEntries[index]
      switch (entry.type) {
        case YOBTA_COLLECTION_INSERT: {
          const snapshots = log
            .filter(
              ({ snapshotId, type }) =>
                snapshotId === entry.snapshotId &&
                type === YOBTA_COLLECTION_REVALIDATE,
            )
            .sort(byCommitted) as YobtaServerLogSnapshotEntry[]
          const data = snapshots.map(
            ({ key, value, committed, merged }) =>
              [key, value, committed, merged] as YobtaCollectionTuple<Snapshot>,
          )
          const operation: YobtaCollectionRevalidateOperation<Snapshot> = {
            id: entry.operationId,
            type: YOBTA_COLLECTION_REVALIDATE,
            channel,
            snapshotId: entry.snapshotId,
            nextSnapshotId: entry.nextSnapshotId,
            committed: entry.committed,
            merged: entry.merged,
            data,
          }
          batch.push(operation)
          break
        }
        case YOBTA_COLLECTION_MOVE: {
          const operation: YobtaCollectionMoveOperation = {
            id: entry.operationId,
            type: YOBTA_COLLECTION_MOVE,
            channel,
            snapshotId: entry.snapshotId,
            nextSnapshotId: entry.nextSnapshotId,
            committed: entry.committed,
            merged: entry.merged,
          }
          batch.push(operation)
          break
        }
        default: {
          const operation = {
            id: entry.operationId,
            type: entry.type,
            channel,
            snapshotId: entry.snapshotId,
            nextSnapshotId: entry.nextSnapshotId,
            committed: entry.committed,
            merged: entry.merged,
          }
          batch.push(operation)
          break
        }
      }
    }
    yield batch
  }
}

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
    const options: ReadableOptions = { objectMode: true }
    return Readable.from(generator, options)
  }
  const merge = async <Snapshot extends SupportedSnapshotsUnion>(
    collection: string,
    rawOperation: YobtaCollectionOperation<Snapshot>,
  ): Promise<YobtaCollectionOperation<Snapshot>> => {
    switch (rawOperation.type) {
      case YOBTA_COLLECTION_INSERT:
      case YOBTA_COLLECTION_UPDATE:
      case YOBTA_COLLECTION_DELETE:
      case YOBTA_COLLECTION_RESTORE:
      case YOBTA_COLLECTION_MOVE:
        break
      default: {
        const errorData = Object.assign({}, rawOperation, {
          message: `Invalid operation`,
        })
        serverLogger.error(errorData)
        throw coerceError(errorData)
      }
    }
    const operation = filterKeys(log, collection, rawOperation)
    const merged = Date.now()
    const withData = mergeData({ log, collection, merged, operation })
    log = mergeCursor({ log: withData, collection, merged, operation })
    const mergedOperation = { ...operation, merged }
    next(mergedOperation)
    serverLogger.debug(mergedOperation)
    return mergedOperation
  }
  return {
    find,
    merge,
    observe,
  }
}
