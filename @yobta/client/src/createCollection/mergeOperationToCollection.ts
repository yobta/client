import { YobtaCollectionAnySnapshot } from '@yobta/protocol'

import {
  YobtaCollectionEntry,
  YobtaCollectionMergeOperation,
  YobtaCollectionVersions,
} from './createCollection.js'

export const mergeOperationToCollection = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  [snapshot, versions, ...pendingOperations]: YobtaCollectionEntry<Snapshot>,
  operation: YobtaCollectionMergeOperation<Snapshot>,
): YobtaCollectionEntry<Snapshot> => {
  const nextSnapshot = { ...snapshot } as YobtaCollectionAnySnapshot
  const nextVersions = {
    ...versions,
  } as YobtaCollectionVersions<YobtaCollectionAnySnapshot>
  for (const key in operation.data) {
    if (operation.committed > (versions[key] || 0)) {
      // @ts-ignore
      nextSnapshot[key] = operation.data[key]
      nextVersions[key] = operation.committed
    }
  }
  const nextPendingOperations = pendingOperations.filter(
    ({ id }) => id !== operation.id,
  )
  const nextItem: YobtaCollectionEntry<Snapshot> = [
    nextSnapshot as Snapshot,
    nextVersions as YobtaCollectionVersions<Snapshot>,
    ...nextPendingOperations,
  ]
  return nextItem
}
