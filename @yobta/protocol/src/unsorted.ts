import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
} from './collection.js'
import { YobtaCommit, YobtaReceived, YobtaReject } from './serverEvents.js'

export type YobtaOperationId = string

// #region Server Events

//#endregion

// #region Client Events
export type YobtaDataOperation =
  | YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>
  | YobtaCollectionUpdateOperation<YobtaCollectionAnySnapshot>

export const YOBTA_BATCH = 'batch'
export type YobtaBatchOperation = {
  id: YobtaOperationId
  channel: string
  type: typeof YOBTA_BATCH
  operations: YobtaDataOperation[]
}
//#endregion

export type YobtaClientOperation =
  | YobtaDataOperation
  | YobtaSubscribe
  | YobtaUnsubscribe
export type YobtaRemoteOperation =
  | YobtaReceived
  | YobtaCommit
  | YobtaReject
  | YobtaError
  | YobtaDataOperation
  | YobtaBatchOperation
export const YOBTA_ERROR = 'error'
export type YobtaError = {
  id: YobtaOperationId
  committed: number
  type: typeof YOBTA_ERROR
  message: string
}
export const YOBTA_SUBSCRIBE = 'subscribe'
export type YobtaSubscribe = {
  id: YobtaOperationId
  channel: string
  version: number
  committed: number
  type: typeof YOBTA_SUBSCRIBE
}
export const YOBTA_UNSUBSCRIBE = 'unsubscribe'
export type YobtaUnsubscribe = {
  id: YobtaOperationId
  channel: string
  committed: number
  type: typeof YOBTA_UNSUBSCRIBE
}
export type YobtaAnyOperation =
  | YobtaReceived
  | YobtaCommit
  | YobtaReject
  | YobtaClientOperation
  | YobtaRemoteOperation
