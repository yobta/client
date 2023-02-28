import {
  PatchWithoutId,
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaCollection } from '../createCollection/index.js'
import { createOperation } from '../createOperation/createOperation.js'
import { operationResult } from '../operationResult/operationResult.js'

interface YobtaChannelFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaChannelProps<Snapshot>,
  ): YobtaChannel<Snapshot>
}

export type YobtaChannel<Snapshot extends YobtaCollectionAnySnapshot> =
  Readonly<{
    name: string
    insert: (snapshot: Snapshot) => Promise<Snapshot | undefined>
    update: (
      id: YobtaCollectionId,
      snapshot: PatchWithoutId<Snapshot>,
    ) => Promise<Snapshot | undefined>
  }>

type YobtaChannelProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  collection: YobtaCollection<Snapshot>
  name: string
}

export const createChannel: YobtaChannelFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  name,
  collection,
}: YobtaChannelProps<Snapshot>) => {
  const insert = async (data: Snapshot): Promise<Snapshot | undefined> => {
    const operation: YobtaCollectionInsertOperation<Snapshot> = createOperation(
      {
        type: YOBTA_COLLECTION_INSERT,
        data,
        channel: name,
        ref: data.id,
      },
    )
    collection.commit(operation)
    await operationResult(operation.id)
    return collection.get(data.id)
  }
  const update = async (
    ref: YobtaCollectionId,
    data: PatchWithoutId<Snapshot>,
  ): Promise<Snapshot | undefined> => {
    const operation: YobtaCollectionUpdateOperation<Snapshot> = createOperation(
      {
        type: YOBTA_COLLECTION_UPDATE,
        data,
        channel: name,
        ref,
      },
    )
    collection.commit(operation)
    await operationResult(operation.id)
    return collection.get(ref)
  }
  return {
    name,
    insert,
    update,
  }
}
