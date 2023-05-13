/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionPatchWithId,
  YobtaCollectionUpdateOperation,
  YobtaCollectionCreateOperation,
  YOBTA_COLLECTION_CREATE,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_CHANNEL_INSERT,
} from '@yobta/protocol'
import { YobtaObserver, createObservable } from '@yobta/stores'

import { queueOperation } from '../queue/queue.js'
import { merge } from './merge.js'
import { YobtaClientStore } from '../createMemoryStore/createMemoryStore.js'
import { revalidate } from './revalidate.js'
import { commit } from './commit.js'
import { YobtaClientLogOperation } from '../createClientLog/createClientLog.js'
import { getEntry } from './getEntry.js'
import { updateSnapshot } from './updateSnapshot.js'
import { clientLogger } from '../clientLogger/clientLogger.js'

// #region types
interface YobtaCollectionFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    store: YobtaClientStore<Snapshot>,
  ): YobtaCollection<Snapshot>
}

export type YobtaCollection<Snapshot extends YobtaCollectionAnySnapshot> = {
  get(id: YobtaCollectionId): Readonly<Snapshot> | undefined
  fetch(channel: string): Promise<YobtaClientLogOperation<Snapshot>[]>
  put(operations: YobtaClientLogOperation<Snapshot>[]): Promise<void>
  observe(
    observer: YobtaObserver<YobtaClientLogOperation<Snapshot>[]>,
  ): VoidFunction
}

export type YobtaCollectionState<Snapshot extends YobtaCollectionAnySnapshot> =
  Record<YobtaCollectionId, YobtaCollectionEntry<Snapshot>>

export type YobtaCollectionEntry<
  Snapshot extends YobtaCollectionAnySnapshot,
  PartialSnapshot extends YobtaCollectionAnySnapshot = YobtaCollectionPatchWithId<Snapshot>,
> = [
  PartialSnapshot,
  Partial<{
    [K in keyof Snapshot]: number
  }>,
  ...(
    | YobtaCollectionCreateOperation<Snapshot>
    | YobtaCollectionUpdateOperation<Snapshot>
  )[],
]
// #endregion

export const createCollection: YobtaCollectionFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  store: YobtaClientStore<Snapshot>,
) => {
  const { observe, next } = createObservable<
    YobtaClientLogOperation<Snapshot>[],
    never
  >()
  let ready = false
  const entries: YobtaCollectionState<Snapshot> = {}
  const snapshots: Record<YobtaCollectionId, Snapshot> = {}
  const get = (id: YobtaCollectionId): Snapshot | undefined => snapshots[id]
  const fetch = async (
    channel: string,
  ): Promise<YobtaClientLogOperation<Snapshot>[]> => {
    if (!ready) {
      const operations = await store.fetch()
      await put(operations)
      ready = true
    }
    return store.fetch(channel)
  }
  const put = async (
    operations: YobtaClientLogOperation<Snapshot>[],
  ): Promise<void> => {
    const ids = new Set<YobtaCollectionId>()
    for (const operation of operations) {
      if (operation.merged > 0) {
        switch (operation.type) {
          case YOBTA_COLLECTION_CREATE:
          case YOBTA_COLLECTION_UPDATE: {
            const entry = getEntry(entries, operation.data.id)
            entries[operation.data.id] = merge(entry, operation)
            ids.add(operation.data.id)
            clientLogger.debug(
              'Merged: ',
              operation,
              entries[operation.data.id],
            )
            break
          }
          case YOBTA_COLLECTION_REVALIDATE: {
            const entry = getEntry(entries, operation.snapshotId)
            entries[operation.snapshotId] = revalidate(entry, operation)
            ids.add(operation.snapshotId)
            clientLogger.debug('Merged: ', operation)
            break
          }
          default: {
            clientLogger.debug('Merge skipped: ', operation)
            break
          }
        }
      } else {
        switch (operation.type) {
          case YOBTA_COLLECTION_CREATE:
          case YOBTA_COLLECTION_UPDATE: {
            commit(entries, operation)
            ids.add(operation.data.id)
            queueOperation(operation)
            break
          }
          case YOBTA_CHANNEL_INSERT:
          case YOBTA_CHANNEL_DELETE:
          case YOBTA_CHANNEL_RESTORE:
          case YOBTA_CHANNEL_SHIFT: {
            queueOperation(operation)
            break
          }
          default: {
            clientLogger.debug('Commit skipped: ', operation)
            break
          }
        }
      }
    }
    for (const id of ids) {
      const entry = entries[id]
      const snapshot = updateSnapshot(entry)
      if (snapshot) {
        snapshots[id] = snapshot
      } else {
        delete snapshots[id]
      }
    }
    next(operations)
    await store.put(operations)
  }
  return {
    get,
    fetch,
    put,
    observe,
  }
}
