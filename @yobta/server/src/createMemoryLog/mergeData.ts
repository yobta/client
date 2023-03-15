import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
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
  const keys = new Set(Object.keys(operation.data))
  const merged = Date.now()
  for (const entry of log) {
    if (
      'key' in entry &&
      entry.snapshotId === operation.snapshotId &&
      entry.collection === collection &&
      entry.key in operation.data &&
      entry.committed < operation.committed
    ) {
      const nextEntry: YobtaServerLogItem = {
        snapshotId: operation.snapshotId,
        collection,
        committed: operation.committed,
        merged,
        key: entry.key,
        value: operation.data[entry.key],
      }
      tail.push(nextEntry)
      keys.delete(entry.key)
    } else {
      head.push(entry)
    }
  }
  for (const key of keys) {
    const entry: YobtaServerLogItem = {
      snapshotId: operation.snapshotId,
      collection,
      committed: operation.committed,
      merged,
      key,
      value: operation.data[key],
    }
    tail.push(entry)
  }
  // for (const key in operation.data) {
  //   for (const entry of log) {
  //     if (
  //       'key' in entry &&
  //       entry.key === key &&
  //       entry.snapshotId === operation.snapshotId &&
  //       entry.collection === collection
  //     ) {
  //       tail.push({
  //         snapshotId: operation.snapshotId,
  //         collection,
  //         committed: operation.committed,
  //         merged: Date.now(),
  //         key,
  //         value: operation.data[key],
  //       })
  //     } else {
  //       head.push(entry)
  //     }
  //   }
  // }
  return head.concat(tail)
}
