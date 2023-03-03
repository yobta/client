import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionInsertOperation,
  YobtaDataOperation,
  YobtaMergeOperation,
  YobtaOperationId,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_MERGE,
  YOBTA_REJECT,
} from '@yobta/protocol'
import { createStore, YobtaReadable } from '@yobta/stores'

type YobtaNotification =
  | YobtaDataOperation
  | YobtaMergeOperation
  | YobtaRejectOperation
interface YobtaLogFactory {
  (operations: YobtaNotification[]): YobtaLog
}
export type YobtaLog = Readonly<{
  add(operations: YobtaNotification[]): void
}> &
  YobtaReadable<YobtaLogEntry[]>
export type YobtaLoggedOperation =
  | YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>
  | YobtaMergeOperation
  | YobtaRejectOperation
export type YobtaLogEntry = [
  YobtaOperationId, // id
  string, // channel
  number, // committed
  number, // merged
  YobtaLoggedOperation['type'], // type
  YobtaCollectionId | undefined, // snapshotId
  YobtaCollectionId | undefined, // nextSnapshotId
]
type YobtaParsedLogEntry = Pick<
  YobtaLoggedOperation,
  | 'id'
  | 'channel'
  | 'committed'
  | 'merged'
  | 'type'
  | 'nextSnapshotId'
  | 'snapshotId'
  | 'type'
>

const createEntryFromOperation = ({
  id,
  channel,
  committed,
  merged,
  type,
  snapshotId,
  nextSnapshotId,
}: YobtaLoggedOperation): YobtaLogEntry => [
  id,
  channel,
  committed,
  merged,
  type,
  snapshotId,
  nextSnapshotId,
]

const parseEntry = ([
  id,
  channel,
  committed,
  merged,
  type,
  snapshotId,
  nextSnapshotId,
]: YobtaLogEntry): YobtaParsedLogEntry => ({
  id,
  channel,
  committed,
  merged,
  type,
  snapshotId,
  nextSnapshotId,
})

const mergeEntry = (
  log: readonly YobtaLogEntry[],
  operation: YobtaLoggedOperation,
): readonly YobtaLogEntry[] => {
  let added = false
  const entry = createEntryFromOperation(operation)
  const result = log.reduce<YobtaLogEntry[]>((acc, existingEntry) => {
    const { id, committed } = parseEntry(existingEntry)
    if (!added && operation.committed <= committed) {
      acc.push(entry)
      added = true
    }
    if (id !== operation.id) {
      acc.push(existingEntry)
    }
    return acc
  }, [])
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!added) {
    result.push(entry)
  }
  return result
}

const supportedOperations = new Set([
  YOBTA_COLLECTION_INSERT,
  YOBTA_MERGE,
  YOBTA_REJECT,
])

export const createLog: YobtaLogFactory = (
  initialOperations: YobtaNotification[],
) => {
  const { last, next, on, observe } = createStore<readonly YobtaLogEntry[]>([])
  const add = (newOperations: YobtaNotification[]): void => {
    let log = last()
    let shouldUpdate = false
    newOperations.forEach(operation => {
      if (supportedOperations.has(operation.type)) {
        log = mergeEntry(log, operation as unknown as YobtaLoggedOperation)
        shouldUpdate = true
      }
    })
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (shouldUpdate) {
      next(log)
    }
  }
  add(initialOperations)
  return {
    add,
    last,
    observe,
    on,
  }
}

export default { mergeEntry, createEntryFromOperation, parseEntry }
