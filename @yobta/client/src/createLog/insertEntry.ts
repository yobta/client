import { YobtaLogEntry } from './createLog.js'

interface YobtaInsertEntry {
  (log: YobtaLogEntry[], entry: YobtaLogEntry): void
}
export const insertEntry: YobtaInsertEntry = (log, entry) => {
  let left = 0
  let right = log.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (log[mid][2] < entry[2]) {
      left = mid + 1
    } else if (log[mid][2] > entry[2]) {
      right = mid - 1
    } else {
      left = mid + 1
      break
    }
  }
  log.splice(left, 0, entry)
}
