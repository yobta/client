import { YobtaCollectionAnySnapshot } from '@yobta/protocol'

import { YobtaClientLogOperation } from './createClientLog.js'

interface YobtaInsertEntry {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operations: YobtaClientLogOperation<Snapshot>[],
    entry: YobtaClientLogOperation<Snapshot>,
  ): void
}
export const insertEntry: YobtaInsertEntry = (operations, operation) => {
  let left = 0
  let right = operations.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (operations[mid].committed < operation.committed) {
      left = mid + 1
    } else if (operations[mid].committed > operation.committed) {
      right = mid - 1
    } else {
      left = mid + 1
      break
    }
  }
  operations.splice(left, 0, operation)
}
