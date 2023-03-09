import { YobtaLogEntry, YobtaLoggedOperation } from '../createLog/createLog.js'
import { createLogEntryFromOperation } from '../createLogEntryFromOperation/createLogEntryFromOperation.js'
import { parseLogEntry } from '../parseLogEntry/parseLogEntry.js'

interface YobtaAddEntryToLog {
  (
    entries: readonly YobtaLogEntry[],
    operation: YobtaLoggedOperation,
  ): readonly YobtaLogEntry[]
}

export const addEntryToLog: YobtaAddEntryToLog = (entries, operation) => {
  let added = false
  const entry = createLogEntryFromOperation(operation)
  const result = entries.reduce<YobtaLogEntry[]>((acc, existingEntry) => {
    const { id, committed } = parseLogEntry(existingEntry)
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
