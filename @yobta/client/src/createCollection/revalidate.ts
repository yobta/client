import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionRevalidateOperation,
} from '@yobta/protocol'

import { YobtaCollectionEntry } from './createCollection.js'

interface YobtaRevalidate {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    entry: YobtaCollectionEntry<Snapshot>,
    operation: YobtaCollectionRevalidateOperation<Snapshot>,
  ): YobtaCollectionEntry<Snapshot>
}

export const revalidate: YobtaRevalidate = (
  [snapshot, versions, ...pendingOperations],
  operation,
) => {
  const nextSnapshot = { ...snapshot }
  const nextVersions = { ...versions }
  for (const [key, value, committed] of operation.data) {
    // @ts-ignore
    if (committed > (versions[key] || 0)) {
      // @ts-ignore
      nextSnapshot[key] = value
      // @ts-ignore
      nextVersions[key] = committed
    }
  }
  return [nextSnapshot, nextVersions, ...pendingOperations]
}
