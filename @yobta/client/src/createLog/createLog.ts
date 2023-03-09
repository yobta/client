import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
  YobtaDataOperation,
  YobtaOperationId,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_REJECT,
} from '@yobta/protocol'
import { createStore, YobtaReadable } from '@yobta/stores'

import { addEntryToLog } from '../addEntryToLog/addEntryToLog.js'

type YobtaNotification = YobtaDataOperation | YobtaRejectOperation
interface YobtaLogFactory {
  (operations: YobtaNotification[]): YobtaLog
}
export type YobtaLog = Readonly<{
  add(operations: YobtaNotification[]): void
}> &
  YobtaReadable<YobtaLogEntry[]>
export type YobtaLoggedOperation =
  | YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>
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
export type YobtaLogEntry = YobtaLogInsertEntry | YobtaLogRejectEntry

export const createLog: YobtaLogFactory = (
  initialOperations: YobtaNotification[],
) => {
  const { last, next, on, observe } = createStore<readonly YobtaLogEntry[]>([])
  const add = (newOperations: YobtaNotification[]): void => {
    let log = last()
    let shouldUpdate = false
    newOperations.forEach(operation => {
      if (
        operation.type === YOBTA_COLLECTION_INSERT ||
        operation.type === YOBTA_REJECT
      ) {
        log = addEntryToLog(log, operation)
        shouldUpdate = true
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
