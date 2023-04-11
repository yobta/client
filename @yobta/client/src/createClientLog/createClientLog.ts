import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionDeleteOperation,
  YobtaCollectionInsertOperation,
  YobtaCollectionShiftOperation,
  YobtaCollectionRestoreOperation,
  YobtaCollectionRevalidateOperation,
  YobtaOperationId,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_SHIFT,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_REJECT,
  YobtaCollectionUpdateOperation,
} from '@yobta/protocol'
import { createObservable } from '@yobta/stores'

import { addOperation } from './addOperation.js'
import { clientLogger } from '../clientLogger/clientLogger.js'

// #region types
interface YobtaClientLogFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    scope?: string,
  ): YobtaClientLog<Snapshot>
}
export type YobtaClientLog<Snapshot extends YobtaCollectionAnySnapshot> =
  Readonly<{
    add(operations: YobtaClientLogOperation<Snapshot>[]): void
    last(): YobtaClientLogOperation<Snapshot>[]
    observe(
      observer: (entries: YobtaClientLogOperation<Snapshot>[]) => void,
    ): VoidFunction
  }>
export type YobtaClientLogOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionRevalidateOperation<Snapshot>
  | YobtaCollectionShiftOperation
  | YobtaCollectionDeleteOperation
  | YobtaCollectionRestoreOperation
  | YobtaRejectOperation
// #endregion

export const createClientLog: YobtaClientLogFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  scope?: string,
) => {
  const log: YobtaClientLogOperation<Snapshot>[] = []
  const ids = new Set<YobtaOperationId>()
  const { next, observe } =
    createObservable<YobtaClientLogOperation<Snapshot>[]>()
  const last = (): YobtaClientLogOperation<Snapshot>[] => log
  const add: YobtaClientLog<Snapshot>['add'] = newOperations => {
    let shouldUpdate = false
    const ops = scope
      ? newOperations.filter(({ channel }) => channel === scope)
      : newOperations
    ops.forEach(operation => {
      switch (operation.type) {
        case YOBTA_COLLECTION_INSERT:
        case YOBTA_COLLECTION_UPDATE:
        case YOBTA_COLLECTION_SHIFT:
        case YOBTA_COLLECTION_DELETE:
        case YOBTA_COLLECTION_RESTORE:
        case YOBTA_COLLECTION_REVALIDATE:
        case YOBTA_REJECT: {
          const hasConflict = ids.has(operation.id)
          const updated = addOperation(log, operation, hasConflict)
          if (updated) {
            ids.add(operation.id)
            shouldUpdate = true
          }
          break
        }
        default:
          clientLogger.error('Unknown operation', operation)
          break
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (shouldUpdate) {
      next(log)
    }
  }
  return {
    add,
    last,
    observe,
  }
}
