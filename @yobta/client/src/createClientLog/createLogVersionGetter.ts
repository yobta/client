import { YobtaCollectionAnySnapshot } from '@yobta/protocol'

import { YobtaClientLogOperation } from '../createClientLog/createClientLog.js'

interface YobtaLogVersionGetterFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    getState: () => YobtaClientLogOperation<Snapshot>[],
  ): YobtaLogVersionGetter
}

export type YobtaLogVersionGetter = () => number

export const createLogVersionGetter: YobtaLogVersionGetterFactory =
  getState => () =>
    getState().reduce((acc, { merged }) => Math.max(acc, merged), 0)
