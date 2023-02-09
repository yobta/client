import { YobtaCollectionItem, YobtaCollectionId } from '@yobta/protocol'

import { YobtaLog } from '../log/log.js'
import { mergeOperation } from './mergeOperation.js'
import { mergeLog, Snapshot } from './mergeLog.js'

interface YobtaCollectionSnapshotFactory {
  <State extends YobtaCollectionItem>(): {
    next(logs: {
      committed: YobtaLog
      pending: YobtaLog
    }): Map<YobtaCollectionId, State>
  }
}

export const createCollectionSnapshot: YobtaCollectionSnapshotFactory = <
  State extends YobtaCollectionItem,
>() => {
  let version: Symbol
  let state: Snapshot<State> = new Map()
  return {
    next({ committed: commited, pending }) {
      if (version !== commited.version) {
        const op = commited.last()
        if (op) {
          // note: an operation can be applied multiple times, but the result will be the same
          mergeOperation(state, op)
        } else {
          state = new Map()
          mergeLog<State>(state, commited)
        }
        version = commited.version
      }
      const pendingState = new Map(state)
      mergeLog<State>(pendingState, pending)
      const result: Map<YobtaCollectionId, State> = new Map()
      pendingState.forEach((value, key): void => {
        if (!value.deleted) result.set(key, value.data)
      })
      return result
    },
  }
}
