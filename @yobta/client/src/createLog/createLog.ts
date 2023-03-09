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

export type YobtaLogInput<Snapshot extends YobtaCollectionAnySnapshot> =
  | YobtaDataOperation<Snapshot>
  | YobtaRejectOperation
interface YobtaLogFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operations: YobtaLogInput<Snapshot>[],
  ): YobtaLog<Snapshot>
}
export type YobtaLog<Snapshot extends YobtaCollectionAnySnapshot> = Readonly<{
  add(operations: YobtaLogInput<Snapshot>[]): void
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

export const createLog: YobtaLogFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  initialOperations: YobtaLogInput<Snapshot>[],
) => {
  const { last, next, on, observe } = createStore<readonly YobtaLogEntry[]>([])
  const add = (newOperations: YobtaLogInput<Snapshot>[]): void => {
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
