/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_SHIFT,
  YobtaCollectionDeleteOperation,
  YobtaCollectionRestoreOperation,
  YobtaCollectionShiftOperation,
  YOBTA_BATCH,
  YobtaCollectionPatchWithId,
  YobtaCollectionPatchWithoutId,
} from '@yobta/protocol'
import { createStore, storeEffect, YobtaReadable } from '@yobta/stores'

import { YobtaCollection } from '../createCollection/createCollection.js'
import { createClientLog } from '../createClientLog/createClientLog.js'
import { createLogVersionGetter } from '../createClientLog/createLogVersionGetter.js'
import { createOperation } from '../createOperation/createOperation.js'
import { createLogMerger } from '../createClientLog/createLogMerger.js'
import { subscribeToServerMessages } from '../subscriptions/subscriptions.js'
import { clientLogger } from '../clientLogger/clientLogger.js'

// #region types
interface YobtaChannelFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaChannelProps<Snapshot>,
  ): YobtaChannel<Snapshot>
}
export type YobtaChannel<Snapshot extends YobtaCollectionAnySnapshot> =
  Readonly<{
    insert(
      snapshot: Snapshot,
      nextSnapshotId?: YobtaCollectionId,
    ): Readonly<YobtaCollectionShiftOperation>
    update<S extends Snapshot>(
      snapshot: YobtaCollectionPatchWithId<S>,
    ): Readonly<YobtaCollectionUpdateOperation<S>>
    delete<Id extends YobtaCollectionId>(
      id: Id,
    ): Readonly<YobtaCollectionDeleteOperation & { snapshotId: Id }>
    restore<Id extends YobtaCollectionId>(
      id: Id,
    ): Readonly<YobtaCollectionRestoreOperation & { snapshotId: Id }>
    move(
      snapshots: Snapshot[],
      from?: number | null,
      to?: number | null,
    ): Readonly<YobtaCollectionShiftOperation> | null
  }> &
    YobtaReadable<Snapshot[], never>

type YobtaChannelProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  collection: YobtaCollection<Snapshot>
  path: string
}
// #endregion

export const createChannel: YobtaChannelFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  collection,
  path: channel,
}: YobtaChannelProps<Snapshot>) => {
  const log = createClientLog<Snapshot>(channel)
  const snapshotsStore = createStore<Snapshot[], never>([])
  const mergeSnapshots = createLogMerger(collection.get)
  storeEffect(snapshotsStore, () => {
    let unmouted = false
    const getVersion = createLogVersionGetter<Snapshot>(log.last)
    const unsubscribe: VoidFunction[] = [
      collection.observe(ops => {
        if (!unmouted) {
          log.add(ops)
          const entries = log.last()
          const nextSnapshots = mergeSnapshots(entries)
          snapshotsStore.next(nextSnapshots)
        }
      }),
    ]
    collection.fetch(channel).then(entries => {
      if (!unmouted) {
        log.add(entries)
        unsubscribe.push(
          subscribeToServerMessages<Snapshot>(
            channel,
            getVersion,
            operation => {
              const payLoad =
                operation.type === YOBTA_BATCH ? operation.data : [operation]
              collection.put(payLoad)
            },
          ),
        )
      }
    })
    return () => {
      unmouted = true
      unsubscribe.forEach(fn => {
        fn()
      })
    }
  })
  const { last, observe, on } = snapshotsStore
  const putOrCatch: typeof collection.put = (...operations) =>
    collection.put(...operations).catch(clientLogger.error)
  return {
    delete<Id extends YobtaCollectionId>(snapshotId: Id) {
      const operation: YobtaCollectionDeleteOperation & { snapshotId: Id } =
        createOperation({
          type: YOBTA_COLLECTION_DELETE,
          channel,
          snapshotId,
        })
      putOrCatch([operation])
      return operation
    },
    insert(data: Snapshot, nextSnapshotId) {
      const insertOperation: YobtaCollectionInsertOperation<Snapshot> =
        createOperation({
          type: YOBTA_COLLECTION_INSERT,
          data,
          channel,
          snapshotId: data.id,
        })
      const shiftOpertion: YobtaCollectionShiftOperation = createOperation({
        type: YOBTA_COLLECTION_SHIFT,
        channel,
        snapshotId: insertOperation.data.id,
        nextSnapshotId,
      })
      putOrCatch([insertOperation, shiftOpertion])
      return shiftOpertion
    },
    last,
    move(snapshots, from, to) {
      let fixedTo = to === snapshots.length - 1 ? null : to
      if (typeof fixedTo === 'number' && fixedTo > (from ?? 0)) {
        fixedTo = fixedTo + 1
      }
      const item = snapshots[from ?? -1]
      const nextItem = snapshots[fixedTo ?? -1]
      if (!item) {
        return null
      }
      const operation: YobtaCollectionShiftOperation = createOperation({
        type: YOBTA_COLLECTION_SHIFT,
        channel,
        snapshotId: item.id,
        nextSnapshotId: nextItem?.id,
      })
      putOrCatch([operation])
      return operation
    },
    observe,
    on,
    restore<Id extends YobtaCollectionId>(snapshotId: Id) {
      const operation: YobtaCollectionRestoreOperation & { snapshotId: Id } =
        createOperation({
          type: YOBTA_COLLECTION_RESTORE,
          channel,
          snapshotId,
        })
      putOrCatch([operation])
      return operation
    },
    update<S extends Snapshot>({ id, ...data }: YobtaCollectionPatchWithId<S>) {
      const operation: YobtaCollectionUpdateOperation<S> = createOperation({
        type: YOBTA_COLLECTION_UPDATE,
        data: data as YobtaCollectionPatchWithoutId<S>,
        channel,
        snapshotId: id,
      })
      putOrCatch([operation])
      return operation
    },
  }
}
