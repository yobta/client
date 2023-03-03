import { YobtaDataOperation, YobtaOperationId } from './unsorted.js'
import { YobtaError } from './clientOperations.js'

export const YOBTA_RECEIVED = 'yobta-received'
export type YobtaReceived = {
  id: YobtaOperationId
  operationId: YobtaOperationId
  received: number
  type: typeof YOBTA_RECEIVED
}

export const YOBTA_MERGE = 'yobta-merge'
export type YobtaMergeOperation = {
  id: YobtaOperationId
  channel: string
  operationId: YobtaOperationId
  committed: number
  merged: number
  type: typeof YOBTA_MERGE
}

export const YOBTA_REJECT = 'yobta-reject'
export type YobtaRejectOperation = {
  id: YobtaOperationId
  channel: string
  reason: string
  operationId: YobtaOperationId
  type: typeof YOBTA_REJECT
  committed: number
  merged: number
}

export const YOBTA_BATCH = 'yobta-batch'
export type YobtaBatchOperation = {
  id: YobtaOperationId
  channel: string
  type: typeof YOBTA_BATCH
  operations: YobtaDataOperation[]
}

export type YobtaRemoteOperation =
  | YobtaReceived
  | YobtaMergeOperation
  | YobtaRejectOperation
  | YobtaError
  | YobtaDataOperation
  | YobtaBatchOperation
