import { YobtaLogEntry } from '../createLog/createLog.js'
import { insertEntry } from './insertEntry.js'

interface YobtaAddEntryToLog {
  (entries: YobtaLogEntry[], entry: YobtaLogEntry): boolean
}

export const addEntryToLog: YobtaAddEntryToLog = (entries, entry) => {
  const index = entries.findIndex(([id]) => id === entry[0])
  if (index === -1) {
    insertEntry(entries, entry)
    return true
  }
  const existingEntry = entries[index]
  if (existingEntry[3] > 0) {
    return false
  }
  entries.splice(index, 1)
  insertEntry(entries, entry)
  return true
}
