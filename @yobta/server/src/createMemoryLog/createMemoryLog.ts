import {
  YobtaCollectionAnySnapshot,
  YOBTA_COLLECTION_CREATE,
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_COLLECTION_UPDATE,
  YobtaCollectionOperation,
  YOBTA_CHANNEL_INSERT,
  YobtaServerDataOperation,
  YobtaServerLog,
  YobtaServerLogStream,
  YobtaServerLogItem,
} from '@yobta/protocol'
import { createObservable } from '@yobta/stores'
import { coerceError } from '@yobta/utils'
import { Readable } from 'stream'

import { serverLogger } from '../serverLogger/serverLogger.js'
import { filterKeys } from './filterKeys.js'
import { mergeCursor } from './mergeCursor.js'
import { mergeData } from './mergeData.js'
import { operationGenerator } from './operationGenerator.js'
import { revalidate } from './revalidate.js'

// #region types
interface YobtaMemoryLogFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(): YobtaServerLog<Snapshot>
}
// #endregion

export const createMemoryLog: YobtaMemoryLogFactory = <
  SupportedSnapshotsUnion extends YobtaCollectionAnySnapshot,
>() => {
  let log: YobtaServerLogItem[] = []
  const { observe, next } = createObservable()
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
    find({ channel, merged }) {
      // TODO: change generator to return one operation at a time
      const generator = operationGenerator({
        channel,
        minMerged: merged,
        log,
      })
      return Readable.from(generator, { objectMode: true })
    },
    merge,
    observe,
  }
}
