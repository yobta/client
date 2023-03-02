import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
  YobtaCollectionOperation,
  YOBTA_COLLECTION_INSERT,
} from '@yobta/protocol'
import { createStore, YobtaReadable } from '@yobta/stores'

interface YobtaLogFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operations: YobtaCollectionOperation<Snapshot>[],
  ): YobtaLog<Snapshot>
}
type YobtaLog<Snapshot extends YobtaCollectionAnySnapshot> = Readonly<{
  add: (operations: YobtaCollectionOperation<Snapshot>[]) => void
}> &
  YobtaReadable<YobtaLogState>
type YobtaLogState = Map<
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
    ref,
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
    [ref, { committed, merged, deleted: false }],
    ...tail,
  ])
}

export const createLog: YobtaLogFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  initialOperations: YobtaCollectionOperation<Snapshot>[],
) => {
  const { last, next, on, observe } = createStore(new Map())
  const add = (newOperations: YobtaCollectionOperation<Snapshot>[]): void => {
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
