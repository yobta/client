/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { YobtaCollectionAnySnapshot } from '@yobta/protocol'

import { YobtaCollectionEntry } from './createCollection.js'
import { merge } from './merge.js'

interface YobtaUpdateSnapshot {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    entry?: YobtaCollectionEntry<Snapshot>,
  ): Snapshot | null
}

export const updateSnapshot: YobtaUpdateSnapshot = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  entry?: YobtaCollectionEntry<Snapshot>,
) => {
  if (!entry) return null
  const [snapshot, versions, ...operations] = entry
  const [resultingSnapshot, resultingVersions] = operations.reduce<
    YobtaCollectionEntry<Snapshot>
  >(merge, [snapshot, versions])
  return resultingVersions.id ? (resultingSnapshot as Snapshot) : null
}
