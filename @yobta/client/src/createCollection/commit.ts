import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionCreateOperation,
  YobtaCollectionUpdateOperation,
} from '@yobta/protocol'

import { YobtaCollectionState } from './createCollection.js'
import { getEntry } from './getEntry.js'

interface YobtaCommit {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    state: YobtaCollectionState<Snapshot>,
    operation:
      | YobtaCollectionCreateOperation<Snapshot>
      | YobtaCollectionUpdateOperation<Snapshot>,
  ): boolean
}

export const commit: YobtaCommit = (state, operation) => {
  const entry = getEntry(state, operation.data.id)
  const committed = entry.slice(2).some(({ id }) => id === operation.id)
  if (!committed) {
    state[operation.data.id] = [...entry, operation]
    return true
  }
  return false
}
