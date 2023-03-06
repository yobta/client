import locals, { YobtaLogEntry } from '../createLog/createLog.js'

const { parseEntry } = locals
interface YobtaLogVersionGetterFactory {
  (getState: () => readonly YobtaLogEntry[]): YobtaLogVersionGetter
}

export type YobtaLogVersionGetter = () => number

export const createLogVersionGetter: YobtaLogVersionGetterFactory =
  getState => () => {
    const log = getState()
    return log.length ? parseEntry(log[log.length - 1]).merged : 0
  }
