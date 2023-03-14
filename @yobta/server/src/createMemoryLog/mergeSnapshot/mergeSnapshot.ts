import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
} from '@yobta/protocol'
import { YobtaJsonValue, YobtaStore } from '@yobta/stores'

interface YobtaServerLogMergeSnapshot {
  <Operation extends YobtaClientDataOperation<YobtaCollectionAnySnapshot>>(
    store: YobtaStore<YobtaServerLogSnapshot[]>,
    collection: string,
    operation: Operation,
  ): Operation
}

export type YobtaServerLogSnapshot = {
  snapshotId: YobtaCollectionId
  collection: string
  committed: number
  merged: number
  key: string
  value: YobtaJsonValue | undefined
}

export const mergeSnapshot: YobtaServerLogMergeSnapshot = (
  store,
  collection,
  operation,
) => {
  const log = store.last()
  const data = Object.entries(operation.data).reduce<typeof operation.data>(
    (acc, [key, value]) => {
      const index = log.findIndex(
        entry =>
          entry.key === key &&
          entry.snapshotId === operation.snapshotId &&
          entry.collection === collection,
      )
      const time = Date.now()
      const entry = log[index]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!entry || entry.committed < operation.committed) {
        const nextEntry: YobtaServerLogSnapshot =
          index in log
            ? log[index]
            : {
                snapshotId: operation.snapshotId,
                collection,
                committed: operation.committed,
                merged: time,
                key,
                value,
              }
        const nextLog = log.filter((_v, i) => i !== index)
        nextLog.push(nextEntry)
        acc[key] = value
        store.next(nextLog)
      }
      return acc
    },
    {},
  )
  return {
    ...operation,
    data,
  }
}
