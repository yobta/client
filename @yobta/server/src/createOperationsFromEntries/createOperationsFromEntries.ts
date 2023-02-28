import { YobtaDataOperation, YOBTA_COLLECTION_UPDATE } from '@yobta/protocol'

import { YobtaLogEntry } from '../createMemoryLog/createMemoryLog.js'

interface CreateOperationsFromEntries {
  (entries: YobtaLogEntry[]): YobtaDataOperation[]
}

export const createOperationsFromEntries: CreateOperationsFromEntries =
  entries =>
    entries.map(
      ({ committed, merged, channel, operationId, key, value, snapshotId }) => {
        const operation: YobtaDataOperation = {
          id: operationId,
          type: YOBTA_COLLECTION_UPDATE,
          channel,
          data: {
            [key]: value,
          },
          ref: snapshotId,
          committed,
          merged,
        }
        return operation
      },
    )
// todo: group by merged
// set type to insert if data.keys includes id
