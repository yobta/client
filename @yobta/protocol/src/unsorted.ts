import { YobtaClientOperation, YobtaError } from './clientOperations.js'
import { YobtaCollectionAnySnapshot } from './collection.js'
import {
  YobtaReceived,
  YobtaRejectOperation,
  YobtaServerOperation,
} from './serverOperations.js'

export type YobtaOperationId = string

export type YobtaAnyOperation =
  | YobtaReceived
  | YobtaRejectOperation
  | YobtaError
  | YobtaClientOperation<YobtaCollectionAnySnapshot>
  | YobtaServerOperation<YobtaCollectionAnySnapshot>
