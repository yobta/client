import { YobtaClientOperation, YobtaError } from './clientOperations.js'
import { YobtaCollectionAnySnapshot } from './collection.js'
import {
  YobtaReceived,
  YobtaRejectOperation,
  YobtaServerOperation,
} from './serverOperations.js'

export type YobtaOperationId = string

export type Prettify<Type> = {
  [Key in keyof Type]: Type[Key]
} & {}

export type YobtaAnyOperation = Prettify<
  | YobtaReceived
  | YobtaRejectOperation
  | YobtaError
  | YobtaClientOperation<YobtaCollectionAnySnapshot>
  | YobtaServerOperation<YobtaCollectionAnySnapshot>
>
