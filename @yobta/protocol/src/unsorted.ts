import { YobtaClientOperation, YobtaError } from './clientOperations.js'
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
} from './collection.js'
import {
  YobtaMergeOperation,
  YobtaReceived,
  YobtaRejectOperation,
  YobtaRemoteOperation,
} from './serverOperations.js'

export type YobtaOperationId = string

export type YobtaDataOperation =
  | YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>
  | YobtaCollectionUpdateOperation<YobtaCollectionAnySnapshot>

export type YobtaAnyOperation =
  | YobtaReceived
  | YobtaMergeOperation
  | YobtaRejectOperation
  | YobtaError
  | YobtaClientOperation
  | YobtaRemoteOperation
