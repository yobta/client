import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionDeleteOperation,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
  YobtaCollectionMoveOperation,
  YobtaCollectionRestoreOperation,
  YobtaCollectionRevalidateOperation,
  YobtaOperationId,
  YobtaRejectOperation,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_REJECT,
} from '@yobta/protocol'
import { createStore, YobtaReadable } from '@yobta/stores'

import { addEntryToLog } from '../addEntryToLog/addEntryToLog.js'

// #region types
export type YobtaClientLogOperation<
  Snapshot extends YobtaCollectionAnySnapshot = YobtaCollectionAnySnapshot,
> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionRevalidateOperation<Snapshot>
  | YobtaCollectionDeleteOperation
  | YobtaCollectionRestoreOperation
  | YobtaCollectionMoveOperation
  | YobtaRejectOperation
interface YobtaLogFactory {
  (operations: YobtaClientLogOperation[]): YobtaClientLog
}
export type YobtaClientLog = Readonly<{
  add(operations: YobtaClientLogOperation[]): void
}> &
  YobtaReadable<YobtaLogEntry[]>
export type YobtaLoggedOperation =
  | YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>
  | YobtaCollectionRevalidateOperation<YobtaCollectionAnySnapshot>
  | YobtaCollectionMoveOperation
  | YobtaCollectionDeleteOperation
  | YobtaCollectionRestoreOperation
  | YobtaRejectOperation

export type YobtaLogInsertEntry = [
  YobtaOperationId, // id
  string, // channel
  number, // committed
  number, // merged
  typeof YOBTA_COLLECTION_INSERT, // type
  YobtaCollectionId, // snapshotId
  YobtaCollectionId | undefined, // nextSnapshotId
  undefined, // target operationId
]
export type YobtaLogRejectEntry = [
  YobtaOperationId, // id
  string, // channel
  number, // committed
  number, // merged
  typeof YOBTA_REJECT, // type
  undefined, // snapshotId
  undefined, // nextSnapshotId
  YobtaOperationId, // target operationId
]
export type YobtaLogMoveEntry = [
  YobtaOperationId, // id
  string, // channel
  number, // committed
  number, // merged
  typeof YOBTA_COLLECTION_MOVE, // type
  YobtaCollectionId, // snapshotId
  YobtaCollectionId, // nextSnapshotId
  undefined, // target operationId
]
export type YobtaLogDeleteEntry = [
  YobtaOperationId, // id
  string, // channel
  number, // committed
  number, // merged
  typeof YOBTA_COLLECTION_DELETE, // type
  YobtaCollectionId, // snapshotId
  undefined, // nextSnapshotId
  undefined, // target operationId
]
export type YobtaLogRestoreEntry = [
  YobtaOperationId, // id
  string, // channel
  number, // committed
  number, // merged
  typeof YOBTA_COLLECTION_RESTORE, // type
  YobtaCollectionId, // snapshotId
  undefined, // nextSnapshotId
  undefined, // target operationId
]
export type YobtaLogEntry =
  | YobtaLogInsertEntry
  | YobtaLogRejectEntry
  | YobtaLogMoveEntry
  | YobtaLogDeleteEntry
  | YobtaLogRestoreEntry
// #endregion

export const createLog: YobtaLogFactory = initialOperations => {
  const { last, next, on, observe } = createStore<YobtaLogEntry[]>([])
  const add: YobtaClientLog['add'] = newOperations => {
    let log = last()
    let shouldUpdate = false
    newOperations.forEach(operation => {
      switch (operation.type) {
        case YOBTA_COLLECTION_INSERT:
        case YOBTA_COLLECTION_MOVE:
        case YOBTA_COLLECTION_DELETE:
        case YOBTA_COLLECTION_RESTORE:
        case YOBTA_COLLECTION_REVALIDATE:
        case YOBTA_REJECT:
          log = addEntryToLog(log, operation)
          shouldUpdate = true
          break
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (shouldUpdate) {
      next(log)
    }
  }
  add(initialOperations)
  return {
    add,
    last,
    observe,
    on,
  }
}
