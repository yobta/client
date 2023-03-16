import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YOBTA_COLLECTION_REVALIDATE,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'

interface YobtaServerLogMergeData {
  <Operation extends YobtaClientDataOperation<YobtaCollectionAnySnapshot>>(
    log: readonly YobtaServerLogItem[],
    collection: string,
    operation: Operation,
  ): YobtaServerLogItem[]
}

export const mergeData: YobtaServerLogMergeData = (
  log,
  collection,
  operation,
) => {
  const head: YobtaServerLogItem[] = []
  const tail: YobtaServerLogItem[] = []
  const merged = Date.now()
  for (const entry of log) {
    if (
      'key' in entry &&
      entry.snapshotId === operation.snapshotId &&
      entry.collection === collection &&
      entry.key in operation.data
    ) {
      if (entry.committed >= operation.committed) {
        throw new Error("Can't merge data with lower committed timestamp")
      }
    } else {
      head.push(entry)
    }
  }
  for (const key in operation.data) {
    tail.push({
      type: YOBTA_COLLECTION_REVALIDATE,
      snapshotId: operation.snapshotId,
      collection,
      committed: operation.committed,
      merged,
      key,
      value: operation.data[key],
    })
  }
  return head.concat(tail)
}
