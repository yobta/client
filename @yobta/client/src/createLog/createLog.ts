import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionInsertOperation,
  YobtaDataOperation,
  YobtaMergeOperation,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_MERGE,
  YOBTA_REJECT,
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
export type YobtaLoggedOperation =
  | YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>
  | YobtaMergeOperation
  | YobtaRejectOperation
export type YobtaLogState = YobtaLoggedOperation[]

const insertEntry = (
  log: readonly YobtaLoggedOperation[],
  newAction: YobtaLoggedOperation,
): readonly YobtaLoggedOperation[] => {
  let added = false
  const result = log.reduce<YobtaLogState>((acc, existingAction) => {
    if (!added && newAction.committed <= existingAction.committed) {
      acc.push(newAction)
      added = true
    }
    if (existingAction.id !== newAction.id) {
      acc.push(existingAction)
    }
    return acc
  }, [])
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!added) {
    result.push(newAction)
  }
  return result
}

const supportedOperations = new Set([
  YOBTA_COLLECTION_INSERT,
  YOBTA_MERGE,
  YOBTA_REJECT,
])

export const createLog: YobtaLogFactory = (
  initialOperations: YobtaNotification[],
) => {
  const { last, next, on, observe } = createStore<
    readonly YobtaLoggedOperation[]
  >([])
  const add = (newOperations: YobtaNotification[]): void => {
    let log = last()
    let shouldUpdate = false
    newOperations.forEach(operation => {
      if (supportedOperations.has(operation.type)) {
        log = insertEntry(log, operation as unknown as YobtaLoggedOperation)
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
