import {
  YOBTA_COLLECTION_UPDATE,
  YobtaCollectionAnySnapshot,
  YobtaCollectionCreateOperation,
  YobtaCollectionUpdateOperation,
} from '@yobta/protocol'

import { YobtaCollectionEntry } from './createCollection.js'

interface YobtaMerge {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    entry: YobtaCollectionEntry<Snapshot>,
    operation:
      | YobtaCollectionCreateOperation<Snapshot>
      | YobtaCollectionUpdateOperation<Snapshot>,
  ): YobtaCollectionEntry<Snapshot>
}

export const merge: YobtaMerge = (
  [snapshot, versions, ...pendingOperations],
  operation,
) => {
  const nextSnapshot = { ...snapshot }
  const nextVersions = { ...versions }

  for (const key in operation.data) {
    if (
      operation.committed > (versions[key] || 0) &&
      !(
        operation.type === YOBTA_COLLECTION_UPDATE && key.toLowerCase() === 'id'
      )
    ) {
      // @ts-ignore
      nextSnapshot[key] = operation.data[key]
      // @ts-ignore
      nextVersions[key] = operation.committed
    }
  }
  const nextPendingOperations = pendingOperations.filter(
    ({ id }) => id !== operation.id,
  )
  return [nextSnapshot, nextVersions, ...nextPendingOperations]
}
