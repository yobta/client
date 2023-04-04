import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
} from '@yobta/protocol'

import { YobtaCollectionState } from './createCollection.js'
import { getEntry } from './getEntry.js'

interface YobtaCommit {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    state: YobtaCollectionState<Snapshot>,
    operation:
      | YobtaCollectionInsertOperation<Snapshot>
      | YobtaCollectionUpdateOperation<Snapshot>,
  ): boolean
}

export const commit: YobtaCommit = (state, operation) => {
  const entry = getEntry(state, operation.snapshotId)
  const committed = entry.slice(2).some(({ id }) => id === operation.id)
  if (!committed) {
    state[operation.snapshotId] = [...entry, operation]
    return true
  }
  return false
}
