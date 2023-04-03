import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionPatchWithId,
  YobtaCollectionUpdateOperation,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionInsertOperation,
} from '@yobta/protocol'
import {
  YobtaReadable,
  createStore,
  YobtaStorePlugin,
  YOBTA_READY,
} from '@yobta/stores'

import { queueOperation } from '../queue/queue.js'
import { getCollecionEntry } from './getCollecionEntry.js'
import { mergeOperationsToCollection } from './mergeOperationsToCollection.js'
import { mergeOperationToCollection } from './mergeOperationToCollection.js'

// #region types
export type YobtaCollection<Snapshot extends YobtaCollectionAnySnapshot> = {
  commit(operation: YobtaCollectionCommitOperation<Snapshot>): void
  merge(operations: YobtaCollectionMergeOperation<Snapshot>[]): void
  get: YobtaGetCollectionSnapshot<Snapshot>
  last(): YobtaCollectionState<Snapshot>
} & YobtaReadable<YobtaCollectionState<Snapshot>, never>
export type YobtaGetCollectionSnapshot<
  Snapshot extends YobtaCollectionAnySnapshot,
> = (id: YobtaCollectionId) => YobtaMaybeSnapshot<Snapshot>

type YobtaCollectionCommitOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
export type YobtaCollectionMergeOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionRevalidateOperation<Snapshot>

export type YobtaCollectionVersions<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  [K in keyof Snapshot]: number
}
type YobtaMaybeSnapshot<Snapshot extends YobtaCollectionAnySnapshot> =
  | Readonly<Snapshot>
  | undefined
export type YobtaCollectionState<Snapshot extends YobtaCollectionAnySnapshot> =
  Map<YobtaCollectionId, YobtaCollectionEntry<Snapshot>>
export type YobtaCollectionEntry<
  Snapshot extends YobtaCollectionAnySnapshot,
  PartialSnapshot extends YobtaCollectionAnySnapshot = YobtaCollectionPatchWithId<Snapshot>,
> = [
  PartialSnapshot,
  YobtaCollectionVersions<PartialSnapshot>,
  ...YobtaCollectionCommitOperation<Snapshot>[],
]
interface YobtaCollectionFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(): YobtaCollection<Snapshot>
}
// #endregion

export const createCollection: YobtaCollectionFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>() => {
  const { last, next, observe, on } = createStore<
    YobtaCollectionState<Snapshot>,
    never
  >(new Map(), ({ addMiddleware }) => {
    addMiddleware(YOBTA_READY, state => {
      state.forEach(([, , ...operations]) => {
        operations.forEach(queueOperation)
      })
      return state
    })
  })
  const getState = (): YobtaCollectionState<Snapshot> => new Map(last())
  const commit = (
    operation: YobtaCollectionCommitOperation<Snapshot>,
  ): void => {
    const state = getState()
    const item = getCollecionEntry(state, operation.snapshotId)
    if (!item.slice(2).some(({ id }) => id === operation.id)) {
      state.set(operation.snapshotId, [...item, operation])
      queueOperation(operation)
      next(state)
    }
  }
  const merge = (
    operations: YobtaCollectionMergeOperation<Snapshot>[],
  ): void => {
    const state = mergeOperationsToCollection(getState(), operations)
    next(state)
  }
  const get = (id: YobtaCollectionId): YobtaMaybeSnapshot<Snapshot> => {
    const item = last().get(id)
    if (!item) return undefined
    const [snapshot, versions, ...operations] = item
    const [resultingSnapshot, resultingVersions] = operations.reduce<
      YobtaCollectionEntry<Snapshot>
    >(mergeOperationToCollection, [snapshot, versions])
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
