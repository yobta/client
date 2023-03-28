/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import {
  YobtaCollectionPatchWithoutId,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_COLLECTION_REVALIDATE,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_MOVE,
  YobtaCollectionDeleteOperation,
  YobtaCollectionRestoreOperation,
  YobtaCollectionMoveOperation,
} from '@yobta/protocol'
import { createDerivedStore, storeEffect, YobtaReadable } from '@yobta/stores'

import { YobtaCollection } from '../createCollection/createCollection.js'
import { createLog, YobtaClientLogOperation } from '../createLog/createLog.js'
import { createLogVersionGetter } from '../createLogVersionGetter/createLogVersionGetter.js'
import { createOperation } from '../createOperation/createOperation.js'
import { createLogMerger } from '../createLogMerger/createLogMerger.js'
import { operationResult } from '../operationResult/operationResult.js'
import { subscribeToServerMessages } from '../subscribeToServerMessages/subscribeToServerMessages.js'
import { queueOperation } from '../queue/queue.js'

// #region types
interface YobtaChannelFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaChannelProps<Snapshot>,
  ): YobtaChannel<Snapshot>
}
export type YobtaChannel<Snapshot extends YobtaCollectionAnySnapshot> =
  Readonly<{
    insert: (snapshot: Snapshot) => Promise<Snapshot | undefined>
    update: (
      id: YobtaCollectionId,
      snapshot: YobtaCollectionPatchWithoutId<Snapshot>,
    ) => Promise<Snapshot | undefined>
    delete: (id: YobtaCollectionId) => Promise<Snapshot | undefined>
    restore: (id: YobtaCollectionId) => Promise<Snapshot | undefined>
    move: (
      snapshots: Snapshot[],
      from?: number | null,
      to?: number | null,
    ) => Promise<void>
  }> &
    YobtaReadable<Snapshot[], never>
type YobtaChannelProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  collection: YobtaCollection<Snapshot>
  operations?: YobtaClientLogOperation[]
  route: string
}
// #endregion

export const createChannel: YobtaChannelFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  collection,
  operations = [],
  route,
}: YobtaChannelProps<Snapshot>) => {
  const log = createLog(operations)
  const derivedStore = createDerivedStore(
    createLogMerger(collection.get),
    log,
    collection,
  )
  storeEffect(derivedStore, () => {
    const getVersion = createLogVersionGetter(log.last)
    const unsubscribe = subscribeToServerMessages<Snapshot>(
      route,
      getVersion,
      operation => {
        switch (operation.type) {
          case YOBTA_COLLECTION_INSERT:
          case YOBTA_COLLECTION_REVALIDATE:
          case YOBTA_COLLECTION_UPDATE: {
            collection.merge([operation])
            break
          }
        }
        switch (operation.type) {
          case YOBTA_COLLECTION_INSERT:
          case YOBTA_COLLECTION_REVALIDATE:
          case YOBTA_COLLECTION_DELETE:
          case YOBTA_COLLECTION_RESTORE:
          case YOBTA_COLLECTION_MOVE:
            log.add([operation as YobtaClientLogOperation])
            break
        }
      },
    )
    return unsubscribe
  })
  const { last, observe, on } = derivedStore
  const insert = async (
    data: Snapshot,
    nextSnapshotId?: YobtaCollectionId,
  ): Promise<Snapshot | undefined> => {
    const operation: YobtaCollectionInsertOperation<Snapshot> = createOperation(
      {
        type: YOBTA_COLLECTION_INSERT,
        data,
        channel: route,
        snapshotId: data.id,
        nextSnapshotId,
      },
    )
    collection.commit(operation)
    log.add([operation])
    await operationResult(operation.id)
    return collection.get(data.id)
  }
  const update = async (
    snapshotId: YobtaCollectionId,
    data: YobtaCollectionPatchWithoutId<Snapshot>,
  ): Promise<Snapshot | undefined> => {
    const operation: YobtaCollectionUpdateOperation<Snapshot> = createOperation(
      {
        type: YOBTA_COLLECTION_UPDATE,
        data,
        channel: route,
        snapshotId,
      },
    )
    collection.commit(operation)
    await operationResult(operation.id)
    return collection.get(snapshotId)
  }
  const del = async (
    snapshotId: YobtaCollectionId,
  ): Promise<Snapshot | undefined> => {
    const operation: YobtaCollectionDeleteOperation = createOperation({
      type: YOBTA_COLLECTION_DELETE,
      channel: route,
      snapshotId,
    })
    queueOperation(operation)
    log.add([operation])
    await operationResult(operation.id)
    return collection.get(snapshotId)
  }
  const restore = async (
    snapshotId: YobtaCollectionId,
  ): Promise<Snapshot | undefined> => {
    const operation: YobtaCollectionRestoreOperation = createOperation({
      type: YOBTA_COLLECTION_RESTORE,
      channel: route,
      snapshotId,
    })
    queueOperation(operation)
    log.add([operation])
    await operationResult(operation.id)
    return collection.get(snapshotId)
  }
  const move = async (
    snapshots: Snapshot[],
    from?: number | null,
    to?: number | null,
  ): Promise<void> => {
    const fixedTo = to === snapshots.length - 1 ? null : to
    const item = snapshots[from ?? -1]
    const nextItem = snapshots[fixedTo ?? -1]
    if (!item) {
      return
    }
    const operation: YobtaCollectionMoveOperation = createOperation({
      type: YOBTA_COLLECTION_MOVE,
      channel: route,
      snapshotId: item.id,
      nextSnapshotId: nextItem?.id,
    })
    queueOperation(operation)
    log.add([operation])
    await operationResult(operation.id)
  }
  return {
    delete: del,
    insert,
    last,
    move,
    observe,
    on,
    restore,
    update,
  }
}
