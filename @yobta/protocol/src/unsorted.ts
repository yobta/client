import { YobtaClientOperation, YobtaError } from './clientOperations.js'
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
} from './collection.js'
import {
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
  | YobtaRejectOperation
  | YobtaError
  | YobtaClientOperation
  | YobtaRemoteOperation
