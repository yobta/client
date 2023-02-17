import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  PatchWithId,
  YobtaCollectionOperation,
} from '@yobta/protocol'
import { YobtaReadable, createStore, YobtaStorePlugin } from '@yobta/stores'

// #region types
type Versions<Snapshot extends YobtaCollectionAnySnapshot> = {
  [K in keyof Snapshot]: number
}

type ResultingSnapshot<Snapshot extends YobtaCollectionAnySnapshot> =
  | Readonly<Snapshot>
  | undefined
type InternalState<Snapshot extends YobtaCollectionAnySnapshot> = Map<
  YobtaCollectionId,
  ItemWithMeta<Snapshot>
>
type ItemWithMeta<
  Snapshot extends YobtaCollectionAnySnapshot,
  PartialSnapshot extends YobtaCollectionAnySnapshot = PatchWithId<Snapshot>,
> = [
  PartialSnapshot,
  Versions<PartialSnapshot>,
  ...YobtaCollectionOperation<Snapshot>[],
]

interface CollectionFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    name: string,
    ...plugins: YobtaStorePlugin<InternalState<Snapshot>, never>[]
  ): {
    commit(operation: YobtaCollectionOperation<Snapshot>): void
    merge(...operations: YobtaCollectionOperation<Snapshot>[]): void
    get(id: YobtaCollectionId): ResultingSnapshot<Snapshot>
    last(): InternalState<Snapshot>
  } & YobtaReadable<InternalState<Snapshot>, never>
}
// #endregion

const getOrCreateItem = <Snapshot extends YobtaCollectionAnySnapshot>(
  state: InternalState<Snapshot>,
  id: YobtaCollectionId,
): ItemWithMeta<Snapshot> => {
  let item = state.get(id)
  if (!item) {
    item = [{ id } as Snapshot, { id: 0 } as Versions<Snapshot>]
  }
  return item
}

const applyOperation = <Snapshot extends YobtaCollectionAnySnapshot>(
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

export const createCollection: CollectionFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  name: string,
  ...plugins: YobtaStorePlugin<InternalState<Snapshot>, never>[]
) => {
  const { last, next, observe, on } = createStore<
    InternalState<Snapshot>,
    never
  >(new Map(), ...plugins)
  const getState = (): InternalState<Snapshot> => new Map(last())
  const commit = (operation: YobtaCollectionOperation<Snapshot>): void => {
    const state = getState()
    const item = getOrCreateItem(state, operation.ref)
    if (!item.slice(2).some(({ id }) => id === operation.id)) {
      state.set(operation.ref, [...item, operation])
      next(state)
    }
  }
  const merge = (...operations: YobtaCollectionOperation<Snapshot>[]): void => {
    const state = getState()
    for (const operation of operations) {
      const item = getOrCreateItem(state, operation.ref)
      const nextItem = applyOperation(item, operation)
      state.set(operation.ref, nextItem)
    }
    next(state)
  }
  const get = (id: YobtaCollectionId): ResultingSnapshot<Snapshot> => {
    const item = last().get(id)
    if (!item) return undefined
    const [snapshot, versions, ...operations] = item
    const [resultingSnapshot, resultingVersions] = operations.reduce<
      ItemWithMeta<Snapshot>
    >(applyOperation, [snapshot, versions])
    return resultingVersions.id
      ? (resultingSnapshot as ResultingSnapshot<Snapshot>)
      : undefined
  }
  return {
    commit,
    merge,
    get,
    last,
    observe,
    on,
  }
}

export default {
  applyOperation,
  getOrCreateItem,
}