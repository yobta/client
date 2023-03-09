import { YobtaLogEntry } from '../createLog/createLog.js'
import { parseLogEntry } from '../parseLogEntry/parseLogEntry.js'

interface YobtaLogVersionGetterFactory {
  (getState: () => readonly YobtaLogEntry[]): YobtaLogVersionGetter
}

export type YobtaLogVersionGetter = () => number

export const createLogVersionGetter: YobtaLogVersionGetterFactory =
  getState => () => {
    const log = getState()
    return log.length ? parseLogEntry(log[log.length - 1]).merged : 0
  }
