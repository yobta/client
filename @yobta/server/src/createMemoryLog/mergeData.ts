import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'

interface YobtaServerLogMergeData {
  <
    Operation extends YobtaClientDataOperation<YobtaCollectionAnySnapshot>,
  >(props: {
    log: YobtaServerLogItem[]
    collection: string
    merged: number
    operation: Operation
  }): YobtaServerLogItem[]
}

export const mergeData: YobtaServerLogMergeData = ({
  log,
  collection,
  merged,
  operation,
}) => {
  switch (operation.type) {
    case YOBTA_COLLECTION_INSERT:
    case YOBTA_COLLECTION_UPDATE: {
      const head: YobtaServerLogItem[] = []
      const updatedKeys = new Set<string>()
      for (const entry of log) {
        if (
          entry.snapshotId === operation.snapshotId &&
          entry.type === YOBTA_COLLECTION_REVALIDATE &&
          entry.collection === collection &&
          entry.key in operation.data
        ) {
          if (entry.committed >= operation.committed) {
            // TODO: change to logger and skip
            throw new Error("Can't merge data with lower committed timestamp")
          } else {
            head.push({
              ...entry,
              committed: operation.committed,
              merged,
              value: operation.data[entry.key],
            })
            updatedKeys.add(entry.key)
          }
        } else {
          head.push(entry)
        }
      }
      for (const key in operation.data) {
        if (updatedKeys.has(key)) {
          break
        }
        head.push({
          type: YOBTA_COLLECTION_REVALIDATE,
          operationId: operation.id,
          snapshotId: operation.snapshotId,
          collection,
          committed: operation.committed,
          merged,
          key,
          value: operation.data[key],
        })
      }
      return head
    }
    default:
      return log
  }
}
