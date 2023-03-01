import {
  YobtaDataOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaLogEntry } from '../createMemoryLog/createMemoryLog.js'

interface CreateOperationsFromEntries {
  (entries: YobtaLogEntry[]): YobtaDataOperation[]
}

export const createOperationsFromEntries: CreateOperationsFromEntries =
  entries =>
    entries.reduce<{
      operations: YobtaDataOperation[]
      indexes: Record<string, number>
    }>(
      (
        acc,
        { committed, merged, channel, operationId, key, value, snapshotId },
      ) => {
        const opIndex =
          operationId in acc.indexes
            ? acc.indexes[operationId]
            : acc.operations.length
        const operation: YobtaDataOperation | undefined = acc.operations[
          opIndex
        ] || {
          id: operationId,
          type: YOBTA_COLLECTION_UPDATE,
          channel,
          data: {},
          ref: snapshotId,
          committed,
          merged,
        }
        operation.data[key] = value
        if (key === 'id') {
          operation.type = YOBTA_COLLECTION_INSERT
        }
        acc.operations[opIndex] = operation
        acc.indexes[operationId] = opIndex
        return acc
      },
      { operations: [], indexes: {} },
    ).operations
