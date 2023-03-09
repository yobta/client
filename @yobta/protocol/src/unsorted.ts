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

export type YobtaDataOperation<Snapshot extends YobtaCollectionAnySnapshot> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>

export type YobtaAnyOperation =
  | YobtaReceived
  | YobtaRejectOperation
  | YobtaError
  | YobtaClientOperation<YobtaCollectionAnySnapshot>
  | YobtaRemoteOperation<YobtaCollectionAnySnapshot>
