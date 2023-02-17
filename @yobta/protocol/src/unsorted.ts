import { YobtaClientOperation } from './clientOperations.js'
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
} from './collection.js'
import {
  YobtaCommit,
  YobtaReceived,
  YobtaReject,
  YobtaRemoteOperation,
} from './serverOperations.js'

export type YobtaOperationId = string

export type YobtaDataOperation =
  | YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>
  | YobtaCollectionUpdateOperation<YobtaCollectionAnySnapshot>

export type YobtaAnyOperation =
  | YobtaReceived
  | YobtaCommit
  | YobtaReject
  | YobtaClientOperation
  | YobtaRemoteOperation
