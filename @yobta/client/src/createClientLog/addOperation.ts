/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { YobtaCollectionAnySnapshot } from '@yobta/protocol'
import { findLastIndex } from '@yobta/utils'

import { YobtaClientLogOperation } from './createClientLog.js'

interface YobtaAddOperationToLog {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operations: YobtaClientLogOperation<Snapshot>[],
    operation: YobtaClientLogOperation<Snapshot>,
    hasConflict: boolean,
  ): boolean
}

export const addOperation: YobtaAddOperationToLog = (
  operations,
  operation,
  hasConflict,
) => {
  const index = hasConflict
    ? findLastIndex(operations, ({ id }) => id === operation.id)
    : -1
  const conflictingOperation = operations[index]
  if (conflictingOperation) {
    if (operation.merged && !conflictingOperation.merged) {
      operations.splice(index, 1)
    } else {
      return false
    }
  }
  // NOTE: we can't use binary search here because committed is not strictly unique
  if (operations[operations.length - 1]?.committed <= operation.committed) {
    operations.push(operation)
  } else {
    const insertIndex = findLastIndex(
      operations,
      ({ committed }) => committed <= operation.committed,
    )
    operations.splice(insertIndex + 1, 0, operation)
  }
  return true
}
