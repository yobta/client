import { YobtaDataOperation, YobtaError, YobtaOperationId } from './unsorted.js'

export const YOBTA_RECEIVED = 'yobta-received'
export type YobtaReceived = {
  id: YobtaOperationId
  ref: YobtaOperationId
  committed: number
  type: typeof YOBTA_RECEIVED
}

export const YOBTA_COMMIT = 'yobta-commit'
export type YobtaCommit = {
  id: YobtaOperationId
  channel: string
  ref: YobtaOperationId
  committed: number
  type: typeof YOBTA_COMMIT
}

export const YOBTA_REJECT = 'yobta-reject'
export type YobtaReject = {
  id: YobtaOperationId
  channel: string
  reason: string
  ref: YobtaOperationId
  type: typeof YOBTA_REJECT
  committed: number
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
  | YobtaCommit
  | YobtaReject
  | YobtaError
  | YobtaDataOperation
  | YobtaBatchOperation
