/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { YobtaCollectionAnySnapshot, YobtaCollectionId } from '@yobta/protocol'

import {
  YobtaCollectionEntry,
  YobtaCollectionState,
} from './createCollection.js'

interface YobtaGetCollectionEntry {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    entries: YobtaCollectionState<Snapshot>,
    id: YobtaCollectionId,
  ): YobtaCollectionEntry<Snapshot>
}

export const getEntry: YobtaGetCollectionEntry = (state, id) =>
  state[id] || [{ id }, { id: 0 }]
