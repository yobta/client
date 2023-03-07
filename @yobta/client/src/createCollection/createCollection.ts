import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  PatchWithId,
  YobtaCollectionOperation,
} from '@yobta/protocol'
import {
  YobtaReadable,
  createStore,
  YobtaStorePlugin,
  YOBTA_READY,
} from '@yobta/stores'

import { queueOperation } from '../queue/queue.js'

// #region types
type Versions<Snapshot extends YobtaCollectionAnySnapshot> = {
  [K in keyof Snapshot]: number
}
type YobtaMaybeSnapshot<Snapshot extends YobtaCollectionAnySnapshot> =
  | Readonly<Snapshot>
  | undefined
export type YobtaCollectionState<Snapshot extends YobtaCollectionAnySnapshot> =
  Map<YobtaCollectionId, ItemWithMeta<Snapshot>>
type ItemWithMeta<
  Snapshot extends YobtaCollectionAnySnapshot,
  PartialSnapshot extends YobtaCollectionAnySnapshot = PatchWithId<Snapshot>,
> = [
  PartialSnapshot,
  Versions<PartialSnapshot>,
  ...YobtaCollectionOperation<Snapshot>[],
]
interface YobtaCollectionFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    initial: YobtaCollectionOperation<Snapshot>[],
    ...plugins: YobtaStorePlugin<YobtaCollectionState<Snapshot>, never>[]
  ): YobtaCollection<Snapshot>
}
export type YobtaCollection<Snapshot extends YobtaCollectionAnySnapshot> = {
  commit(operation: YobtaCollectionOperation<Snapshot>): void
  merge(...operations: YobtaCollectionOperation<Snapshot>[]): void
  get: YobtaGetCollectionSnapshot<Snapshot>
  last(): YobtaCollectionState<Snapshot>
} & YobtaReadable<YobtaCollectionState<Snapshot>, never>

export type YobtaGetCollectionSnapshot<
  Snapshot extends YobtaCollectionAnySnapshot,
> = (id: YobtaCollectionId) => YobtaMaybeSnapshot<Snapshot>
// #endregion

const getOrCreateItem = <Snapshot extends YobtaCollectionAnySnapshot>(
  state: YobtaCollectionState<Snapshot>,
  id: YobtaCollectionId,
): ItemWithMeta<Snapshot> => {
  let item = state.get(id)
  if (!item) {
    item = [{ id } as Snapshot, { id: 0 } as Versions<Snapshot>]
  }
  return item
}

const mergeOne = <Snapshot extends YobtaCollectionAnySnapshot>(
  [snapshot, versions, ...pendingOperations]: ItemWithMeta<Snapshot>,
  operation: YobtaCollectionOperation<Snapshot>,
): ItemWithMeta<Snapshot> => {
  const nextSnapshot = { ...snapshot } as YobtaCollectionAnySnapshot
  const nextVersions = { ...versions } as Versions<YobtaCollectionAnySnapshot>
  for (const key in operation.data) {
    if (operation.committed > (versions[key] || 0)) {
      nextSnapshot[key] = operation.data[key]
      nextVersions[key] = operation.committed
    }
  }
  const nextPendingOperations = pendingOperations.filter(
    ({ id }) => id !== operation.id,
  )
  const nextItem: ItemWithMeta<Snapshot> = [
    nextSnapshot as Snapshot,
    nextVersions as Versions<Snapshot>,
    ...nextPendingOperations,
  ]
  return nextItem
}

const mergeSome = <Snapshot extends YobtaCollectionAnySnapshot>(
  state: YobtaCollectionState<Snapshot>,
  operations: YobtaCollectionOperation<Snapshot>[],
): YobtaCollectionState<Snapshot> =>
  operations.reduce((acc, operation) => {
    const item = getOrCreateItem(acc, operation.snapshotId)
    const nextItem = mergeOne(item, operation)
    acc.set(operation.snapshotId, nextItem)
    return acc
  }, state)

export const createCollection: YobtaCollectionFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  initial: YobtaCollectionOperation<Snapshot>[],
  ...plugins: YobtaStorePlugin<YobtaCollectionState<Snapshot>, never>[]
) => {
  const { last, next, observe, on } = createStore<
    YobtaCollectionState<Snapshot>,
    never
  >(
    mergeSome(new Map(), initial),
    // TODO: тест что стор отправляет коммиты в очередь
    // TODO: тест что коммиты отправляются после того как отработают остальные миддлвары
    ({ addMiddleware }) => {
      addMiddleware(YOBTA_READY, state => {
        state.forEach(([, , ...operations]) => {
          operations.forEach(queueOperation)
        })
        return state
      })
    },
    ...plugins,
  )
  const getState = (): YobtaCollectionState<Snapshot> => new Map(last())
  const commit = (operation: YobtaCollectionOperation<Snapshot>): void => {
    const state = getState()
    const item = getOrCreateItem(state, operation.snapshotId)
    if (!item.slice(2).some(({ id }) => id === operation.id)) {
      state.set(operation.snapshotId, [...item, operation])
      queueOperation(operation)
      next(state)
    }
  }
  const merge = (...operations: YobtaCollectionOperation<Snapshot>[]): void => {
    const state = mergeSome(getState(), operations)
    next(state)
  }
  const get = (id: YobtaCollectionId): YobtaMaybeSnapshot<Snapshot> => {
    const item = last().get(id)
    if (!item) return undefined
    const [snapshot, versions, ...operations] = item
    const [resultingSnapshot, resultingVersions] = operations.reduce<
      ItemWithMeta<Snapshot>
    >(mergeOne, [snapshot, versions])
    return resultingVersions.id
      ? (resultingSnapshot as YobtaMaybeSnapshot<Snapshot>)
      : undefined
  }
  return {
    commit,
    get,
    last,
    merge,
    observe,
    on,
  }
}

export default {
  getOrCreateItem,
  mergeOne,
  mergeSome,
}
