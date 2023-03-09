import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionSnapshotKey,
  YobtaDataOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaLogEntry } from '../createMemoryLog/createMemoryLog.js'

export const createOperationsFromEntries = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  entries: YobtaLogEntry[],
): YobtaDataOperation<Snapshot>[] =>
  entries.reduce<{
    operations: YobtaDataOperation<Snapshot>[]
    indexes: { [key: YobtaCollectionSnapshotKey]: number }
  }>(
    (
      acc,
      { committed, merged, channel, operationId, key, value, snapshotId },
    ) => {
      const opIndex =
        operationId in acc.indexes
          ? acc.indexes[operationId]
          : acc.operations.length
      const operation: YobtaDataOperation<Snapshot> | undefined = acc
        .operations[opIndex] || {
        id: operationId,
        type: YOBTA_COLLECTION_UPDATE,
        channel,
        data: {},
        snapshotId,
        committed,
        merged,
      }
      Object.assign(operation.data, { [key]: value })
      if (key === 'id') {
        operation.type = YOBTA_COLLECTION_INSERT
      }
      acc.operations[opIndex] = operation
      acc.indexes[operationId] = opIndex
      return acc
    },
    { operations: [], indexes: {} },
  ).operations
