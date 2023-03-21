import {
  YobtaCollectionAnySnapshot,
  YOBTA_COLLECTION_REVALIDATE,
} from '@yobta/protocol'

import {
  YobtaCollectionMergeOperation,
  YobtaCollectionState,
} from './createCollection.js'
import { getCollecionEntry } from './getCollecionEntry.js'
import { mergeOperationToCollection } from './mergeOperationToCollection.js'
import { revalidateCollectionEntry } from './revalidateCollectionEntry.js'

export const mergeOperationsToCollection = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  state: YobtaCollectionState<Snapshot>,
  operations: YobtaCollectionMergeOperation<Snapshot>[],
): YobtaCollectionState<Snapshot> =>
  operations.reduce((acc, operation) => {
    const item = getCollecionEntry(acc, operation.snapshotId)
    const nextItem =
      operation.type === YOBTA_COLLECTION_REVALIDATE
        ? revalidateCollectionEntry(item, operation)
        : mergeOperationToCollection(item, operation)
    acc.set(operation.snapshotId, nextItem)
    return acc
  }, state)
