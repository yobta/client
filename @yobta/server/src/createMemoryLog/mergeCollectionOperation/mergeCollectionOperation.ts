import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
} from '@yobta/protocol'
import { YobtaStore } from '@yobta/stores'

interface YobtaServerLogMergeToChannel {
  <
    Operation extends YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>,
  >(
    store: YobtaStore<YobtaChannelLogEntry[]>,
    operation: Operation,
  ): void
}

export type YobtaChannelLogEntry = {
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  channel: string
  committed: number
  merged: number
  deleted: boolean
}
export const mergeCollectionOperation: YobtaServerLogMergeToChannel = (
  store,
  operation,
) => {
  const log = store.last()
  const entry = log.find(
    ({ snapshotId, channel }) =>
      snapshotId === operation.snapshotId && channel === operation.channel,
  )
  if (entry && entry.committed > operation.committed) {
    return
  }
  const nextLog = log.filter(
    ({ snapshotId }) => snapshotId !== operation.snapshotId,
  )
  const nextEntry: YobtaChannelLogEntry = entry || {
    snapshotId: operation.snapshotId,
    nextSnapshotId: operation.nextSnapshotId,
    channel: operation.channel,
    committed: operation.committed,
    merged: Date.now(),
    deleted: false,
  }
  nextLog.push(nextEntry)
  store.next(nextLog)
}
