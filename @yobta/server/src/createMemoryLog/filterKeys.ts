import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YOBTA_COLLECTION_REVALIDATE,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'

interface YobtaServerLogFilterKeys {
  <Operation extends YobtaClientDataOperation<YobtaCollectionAnySnapshot>>(
    log: readonly YobtaServerLogItem[],
    collection: string,
    operation: Operation,
  ): Operation
}

export const filterKeys: YobtaServerLogFilterKeys = (
  log,
  collection,
  operation,
) => {
  const nextData: typeof operation.data = {}
  for (const k in operation.data) {
    const entry = log.find(
      e =>
        e.snapshotId === operation.snapshotId &&
        e.type === YOBTA_COLLECTION_REVALIDATE &&
        e.key === k &&
        e.collection === collection,
    )
    if (!entry || entry.committed < operation.committed) {
      nextData[k] = operation.data[k]
    }
  }
  const nextOperation = {
    ...operation,
    data: nextData,
  }
  return nextOperation
}
