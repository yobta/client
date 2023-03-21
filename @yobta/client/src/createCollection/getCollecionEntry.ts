import { YobtaCollectionAnySnapshot, YobtaCollectionId } from '@yobta/protocol'

import {
  YobtaCollectionEntry,
  YobtaCollectionState,
  YobtaCollectionVersions,
} from './createCollection.js'

export const getCollecionEntry = <Snapshot extends YobtaCollectionAnySnapshot>(
  state: YobtaCollectionState<Snapshot>,
  id: YobtaCollectionId,
): YobtaCollectionEntry<Snapshot> => {
  let item = state.get(id)
  if (!item) {
    item = [{ id } as Snapshot, { id: 0 } as YobtaCollectionVersions<Snapshot>]
  }
  return item
}
