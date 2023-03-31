import { YobtaCollectionAnySnapshot } from '@yobta/protocol'
import { findLastIndex } from '@yobta/utils'

import { YobtaClientLogOperation } from './createClientLog.js'
import { insertEntry } from './insertEntry.js'

interface YobtaAddOperationToLog {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operations: YobtaClientLogOperation<Snapshot>[],
    operation: YobtaClientLogOperation<Snapshot>,
  ): boolean
}

export const addOperation: YobtaAddOperationToLog = (operations, operation) => {
  const index = findLastIndex(operations, ({ id }) => id === operation.id)
  if (index === -1) {
    insertEntry(operations, operation)
    return true
  }
  const existingEntry = operations[index]
  if (existingEntry.merged > 0) {
    return false
  }
  operations.splice(index, 1)
  insertEntry(operations, operation)
  return true
}
