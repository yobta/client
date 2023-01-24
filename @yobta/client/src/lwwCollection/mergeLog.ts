import { YobtaCollectionItem, YobtaCollectionId } from '@yobta/protocol'

import { YobtaLog } from '../log/log.js'
import { mergeOperation } from './mergeOperation.js'

interface MergeLog {
  <State extends YobtaCollectionItem>(
    state: Map<YobtaCollectionId, SnapshotValue<State>>,
    log: YobtaLog,
  ): void
}

export type Snapshot<State extends YobtaCollectionItem> = Map<
  YobtaCollectionId,
  SnapshotValue<State>
>

type SnapshotValue<State extends YobtaCollectionItem> = {
  data: State
  deleted: boolean
}

export const mergeLog: MergeLog = (state, log) => {
  for (let operation of log.values()) mergeOperation(state, operation)
}
