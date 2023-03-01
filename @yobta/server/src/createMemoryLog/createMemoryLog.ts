import {
  YobtaCollectionId,
  YobtaDataOperation,
  YobtaOperationId,
} from '@yobta/protocol'
import { YobtaJsonValue } from '@yobta/stores'

interface YobtaMemoryLogFactory {
  (): YobtaLog
}

export type YobtaLogEntry = {
  snapshotId: YobtaCollectionId
  channel: string
  key: string
  value: YobtaJsonValue | undefined
  committed: number
  merged: number
  operationId: YobtaOperationId
}

export type YobtaLog = {
  find(channel: string, merged: number): Promise<YobtaLogEntry[]>
  merge(operations: YobtaDataOperation[]): Promise<YobtaLogEntry[][]>
}

type YobtaMemoryLog = Map<string, YobtaLogEntry>

const getEntryId = (
  channel: string,
  snapshotId: YobtaCollectionId,
  key: string,
): string => `${channel}.${snapshotId}.${key}`

const mergeOperation = (
  log: YobtaMemoryLog,
  operation: YobtaDataOperation,
): YobtaLogEntry[] => {
  const result: YobtaLogEntry[] = []
  Object.entries(operation.data).forEach(([key, value]) => {
    const entryKey = getEntryId(operation.channel, operation.ref, key)
    const candidateEntry: YobtaLogEntry = {
      channel: operation.channel,
      key,
      value,
      committed: operation.committed,
      merged: Date.now(),
      operationId: operation.id,
      snapshotId: operation.ref,
    }
    const existingEntry = log.get(entryKey)
    if (candidateEntry.committed > (existingEntry?.committed || 0)) {
      log.set(entryKey, candidateEntry)
      result.push(candidateEntry)
    }
  })
  return result
}

export const createMemoryLog: YobtaMemoryLogFactory = () => {
  const log: YobtaMemoryLog = new Map()
  const find: YobtaLog['find'] = async (channel, merged) => {
    const result: YobtaLogEntry[] = []
    for (const entry of log.values()) {
      if (entry.channel === channel && entry.merged > merged) {
        result.push(entry)
      }
    }
    return result
  }
  const merge: YobtaLog['merge'] = async operations =>
    operations
      .map(operation => mergeOperation(log, operation))
      .filter(chunk => chunk.length)
  return {
    find,
    merge,
  }
}

export default { mergeOperation }
