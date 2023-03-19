import {
  YobtaCollectionPatchWithoutId,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
  YobtaCollectionOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YobtaCollectionPatchWithId,
} from '@yobta/protocol'
import { createDerivedStore, storeEffect, YobtaReadable } from '@yobta/stores'

import { YobtaCollection } from '../createCollection/createCollection.js'
import { createLog, YobtaClientLogOperation } from '../createLog/createLog.js'
import { createLogVersionGetter } from '../createLogVersionGetter/createLogVersionGetter.js'
import { createOperation } from '../createOperation/createOperation.js'
import { createLogMerger } from '../createLogMerger/createLogMerger.js'
import { operationResult } from '../operationResult/operationResult.js'
import { subscribeToServerMessages } from '../subscribeToServerMessages/subscribeToServerMessages.js'

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
  }> &
    YobtaReadable<Snapshot[], never>
type YobtaChannelProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  collection: YobtaCollection<Snapshot>
  operations?: YobtaCollectionOperation<Snapshot>[]
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
        log.add([
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          operation as YobtaClientLogOperation<
            YobtaCollectionPatchWithId<Snapshot>
          >,
        ])
        if (
          operation.type === YOBTA_COLLECTION_INSERT ||
          operation.type === YOBTA_COLLECTION_UPDATE
        ) {
          collection.merge(operation)
        }
      },
    )
    return unsubscribe
  })
  const { last, observe, on } = derivedStore
  const insert = async (data: Snapshot): Promise<Snapshot | undefined> => {
    const operation: YobtaCollectionInsertOperation<Snapshot> = createOperation(
      {
        type: YOBTA_COLLECTION_INSERT,
        data,
        channel: route,
        snapshotId: data.id,
      },
    )
    collection.commit(operation)
    log.add([operation])
    await operationResult(operation.id)
    return collection.get(data.id)
  }
  const update = async (
    ref: YobtaCollectionId,
    data: YobtaCollectionPatchWithoutId<Snapshot>,
  ): Promise<Snapshot | undefined> => {
    const operation: YobtaCollectionUpdateOperation<Snapshot> = createOperation(
      {
        type: YOBTA_COLLECTION_UPDATE,
        data,
        channel: route,
        snapshotId: ref,
      },
    )
    collection.commit(operation)
    log.add([operation])
    await operationResult(operation.id)
    return collection.get(ref)
  }
  return {
    insert,
    last,
    observe,
    on,
    update,
  }
}
