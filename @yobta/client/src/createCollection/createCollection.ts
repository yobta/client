/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionPatchWithId,
  YobtaCollectionUpdateOperation,
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_MOVE,
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
    | YobtaCollectionInsertOperation<Snapshot>
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
    const ids: YobtaCollectionId[] = []
    for (const operation of operations) {
      if (operation.snapshotId) {
        ids.push(operation.snapshotId)
      }
      if (operation.merged > 0) {
        switch (operation.type) {
          case YOBTA_COLLECTION_INSERT:
          case YOBTA_COLLECTION_UPDATE: {
            const entry = getEntry(entries, operation.snapshotId)
            entries[operation.snapshotId] = merge(entry, operation)
            clientLogger.debug('Merged: ', operation)
            break
          }
          case YOBTA_COLLECTION_REVALIDATE: {
            const entry = getEntry(entries, operation.snapshotId)
            entries[operation.snapshotId] = revalidate(entry, operation)
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
          case YOBTA_COLLECTION_INSERT:
          case YOBTA_COLLECTION_UPDATE:
          case YOBTA_COLLECTION_DELETE:
          case YOBTA_COLLECTION_RESTORE:
          case YOBTA_COLLECTION_MOVE: {
            if (
              operation.type === YOBTA_COLLECTION_INSERT ||
              operation.type === YOBTA_COLLECTION_UPDATE
            ) {
              commit(entries, operation)
              clientLogger.debug('Already committed: ', operation)
            }
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
