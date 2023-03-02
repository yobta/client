import { YobtaLogState } from '../createLog/createLog.js'

interface YobtaLogVersionGetterFactory {
  (getState: () => YobtaLogState): YobtaLogVersionGetter
}

export type YobtaLogVersionGetter = () => number

export const createLogVersionGetter: YobtaLogVersionGetterFactory =
  getState => () => {
    let version = 0
    for (const { merged } of getState().values()) {
      if (merged > version) version = merged
    }
    return version
  }
