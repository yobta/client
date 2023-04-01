import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionDeleteOperation,
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
import { createObservable } from '@yobta/stores'

import { addOperation } from './addOperation.js'

// #region types
interface YobtaClientLogFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operations: YobtaClientLogOperation<Snapshot>[],
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
  | YobtaCollectionRevalidateOperation<Snapshot>
  | YobtaCollectionMoveOperation
  | YobtaCollectionDeleteOperation
  | YobtaCollectionRestoreOperation
  | YobtaRejectOperation
// #endregion

export const createClientLog: YobtaClientLogFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  initialOperations: YobtaClientLogOperation<Snapshot>[],
) => {
  const log: YobtaClientLogOperation<Snapshot>[] = []
  const ids = new Set<YobtaOperationId>()
  const { next, observe } =
    createObservable<YobtaClientLogOperation<Snapshot>[]>()
  const last = (): YobtaClientLogOperation<Snapshot>[] => log
  const add: YobtaClientLog<Snapshot>['add'] = newOperations => {
    let shouldUpdate = false
    newOperations.forEach(operation => {
      switch (operation.type) {
        case YOBTA_COLLECTION_INSERT:
        case YOBTA_COLLECTION_MOVE:
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
          throw new Error('Unknown operation')
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
  }
}
