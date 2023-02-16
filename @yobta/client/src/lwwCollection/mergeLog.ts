import { YobtaCollectionAnySnapshot, YobtaCollectionId } from '@yobta/protocol'

import { YobtaLog } from '../log/log.js'
import { mergeOperation } from './mergeOperation.js'

interface MergeLog {
  <State extends YobtaCollectionAnySnapshot>(
    state: Map<YobtaCollectionId, SnapshotValue<State>>,
    log: YobtaLog,
  ): void
}

export type Snapshot<State extends YobtaCollectionAnySnapshot> = Map<
  YobtaCollectionId,
  SnapshotValue<State>
>

type SnapshotValue<State extends YobtaCollectionAnySnapshot> = {
  data: State
  deleted: boolean
}

export const mergeLog: MergeLog = (state, log) => {
  for (const operation of log.values()) mergeOperation(state, operation)
}
