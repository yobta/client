import {
  YobtaCollectionAnySnapshot,
  YOBTA_COLLECTION_CREATE,
  YOBTA_COLLECTION_UPDATE,
  YobtaCollectionCreateOperation,
  YobtaCollectionUpdateOperation,
  Prettify,
} from '@yobta/protocol'

import { YobtaServerLogItem } from './createMemoryLog.js'

export type YobtaFilteredOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> = Prettify<
  | YobtaCollectionCreateOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
>

export const filterKeys = <Snapshot extends YobtaCollectionAnySnapshot>(
  log: readonly YobtaServerLogItem[],
  collection: string,
  operation: YobtaFilteredOperation<Snapshot>,
): YobtaFilteredOperation<Snapshot> => {
  switch (operation.type) {
    case YOBTA_COLLECTION_CREATE:
    case YOBTA_COLLECTION_UPDATE: {
      const snapshot: Snapshot = {} as Snapshot
      for (const key in operation.data) {
        const entry = log.find(
          currentEntry =>
            currentEntry.snapshotId === operation.data.id &&
            currentEntry.key === key &&
            currentEntry.collection === collection,
        )
        if (!entry || entry.committed < operation.committed) {
          Object.assign(snapshot, { [key]: operation.data[key] })
        }
      }
      const nextOperation: YobtaFilteredOperation<Snapshot> = {
        ...operation,
        data: snapshot,
      }
      return nextOperation
    }
    default:
      return operation
  }
}
