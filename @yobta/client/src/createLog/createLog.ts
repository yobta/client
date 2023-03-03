import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
  YobtaDataOperation,
  YobtaMergeOperation,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
} from '@yobta/protocol'
import { createStore, YobtaReadable } from '@yobta/stores'

type YobtaNotification =
  | YobtaDataOperation
  | YobtaMergeOperation
  | YobtaRejectOperation
interface YobtaLogFactory {
  (operations: YobtaNotification[]): YobtaLog
}
export type YobtaLog = Readonly<{
  add(operations: YobtaNotification[]): void
}> &
  YobtaReadable<YobtaLogState>
export type YobtaLogState = Map<
  YobtaCollectionId,
  {
    committed: number
    merged: number
    deleted: boolean
  }
>

const insertEntry = (
  log: YobtaLogState,
  {
    committed,
    merged,
    snapshotId,
  }: YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>,
): YobtaLogState => {
  const head = new Map(log)
  const tail = new Map()
  for (const [key, item] of log) {
    if (item.committed > committed) {
      tail.set(key, item)
      head.delete(key)
    }
  }
  return new Map([
    ...head,
    [snapshotId, { committed, merged, deleted: false }],
    ...tail,
  ])
}

export const createLog: YobtaLogFactory = (
  initialOperations: YobtaNotification[],
) => {
  const { last, next, on, observe } = createStore(new Map())
  const add = (newOperations: YobtaNotification[]): void => {
    let log = last()
    let shouldUpdate = false
    newOperations.forEach(operation => {
      if (operation.type === YOBTA_COLLECTION_INSERT) {
        log = insertEntry(log, operation)
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

export default { insertEntry }
