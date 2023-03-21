import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionRevalidateOperation,
} from '@yobta/protocol'

import {
  YobtaCollectionEntry,
  YobtaCollectionVersions,
} from './createCollection.js'

export const revalidateCollectionEntry = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  [snapshot, versions, ...pendingOperations]: YobtaCollectionEntry<Snapshot>,
  operation: YobtaCollectionRevalidateOperation<Snapshot>,
): YobtaCollectionEntry<Snapshot> => {
  const nextSnapshot = { ...snapshot } as YobtaCollectionAnySnapshot
  const nextVersions = {
    ...versions,
  } as YobtaCollectionVersions<YobtaCollectionAnySnapshot>
  for (const [key, value, committed] of operation.data) {
    // @ts-ignore
    if (committed > (versions[key] || 0)) {
      // @ts-ignore
      nextSnapshot[key] = value
      // @ts-ignore
      nextVersions[key] = committed
    }
  }
  const nextItem: YobtaCollectionEntry<Snapshot> = [
    nextSnapshot as Snapshot,
    nextVersions as YobtaCollectionVersions<Snapshot>,
    ...pendingOperations,
  ]
  return nextItem
}
