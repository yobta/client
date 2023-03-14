import {
  YobtaClientDataOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionTuple,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_REVALIDATE,
} from '@yobta/protocol'
import { createStore } from '@yobta/stores'
import { nanoid } from 'nanoid'

import {
  mergeCollectionOperation,
  YobtaChannelLogEntry,
} from './mergeCollectionOperation/mergeCollectionOperation.js'
import {
  mergeSnapshot,
  YobtaServerLogSnapshot,
} from './mergeSnapshot/mergeSnapshot.js'

interface YobtaMemoryLogFactory {
  (): YobtaLog
}

export type YobtaLog = {
  find(
    channel: string,
    merged: number,
  ): Promise<YobtaCollectionRevalidateOperation<YobtaCollectionAnySnapshot>[]>
  merge<
    Operations extends YobtaClientDataOperation<YobtaCollectionAnySnapshot>[],
  >(
    collection: string,
    operations: Operations,
  ): Promise<Operations>
}

export const createMemoryLog: YobtaMemoryLogFactory = () => {
  const snapshotsStore = createStore<YobtaServerLogSnapshot[]>([])
  const channelsStore = createStore<YobtaChannelLogEntry[]>([])
  const find: YobtaLog['find'] = async (channel, minMerged) => {
    const operations = channelsStore.last()
    const snashots = snapshotsStore.last()
    return operations
      .filter(entry => entry.channel === channel && entry.merged > minMerged)
      .map(entry => {
        const data: YobtaCollectionTuple<YobtaCollectionAnySnapshot>[] =
          snashots
            .filter(({ snapshotId }) => snapshotId === entry.snapshotId)
            .map(({ key, value, committed, merged }) => [
              key,
              value,
              committed,
              merged,
            ])
        const operation: YobtaCollectionRevalidateOperation<YobtaCollectionAnySnapshot> =
          {
            id: nanoid(),
            type: YOBTA_COLLECTION_REVALIDATE,
            channel,
            snapshotId: entry.snapshotId,
            nextSnapshotId: entry.nextSnapshotId,
            committed: entry.committed,
            merged: entry.merged,
            deleted: entry.deleted,
            data,
          }
        return operation
      })
  }
  const merge: YobtaLog['merge'] = async (collection, operations) => {
    const nextOps = operations.reduce<typeof operations>((acc, operation) => {
      const mergedOperation = mergeSnapshot(
        snapshotsStore,
        collection,
        operation,
      )
      if (operation.type === YOBTA_COLLECTION_INSERT) {
        mergeCollectionOperation(channelsStore, operation)
      }
      acc.push(mergedOperation)
      return acc
    }, [] as unknown as typeof operations)
    return nextOps
  }
  return {
    find,
    merge,
  }
}
