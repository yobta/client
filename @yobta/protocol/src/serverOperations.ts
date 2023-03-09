import { YobtaCollectionAnySnapshot } from './collection.js'
import { YobtaDataOperation, YobtaOperationId } from './unsorted.js'

export const YOBTA_RECEIVED = 'yobta-received'
export type YobtaReceived = {
  id: YobtaOperationId
  operationId: YobtaOperationId
  received: number
  type: typeof YOBTA_RECEIVED
}

export const YOBTA_REJECT = 'yobta-reject'
export type YobtaRejectOperation = {
  id: YobtaOperationId
  channel: string
  reason: string
  operationId: YobtaOperationId
  snapshotId?: never
  nextSnapshotId?: never
  type: typeof YOBTA_REJECT
  committed: number
  merged: number
}

export type YobtaRemoteOperation<Snapshot extends YobtaCollectionAnySnapshot> =
  | YobtaReceived
  | YobtaRejectOperation
  | YobtaDataOperation<Snapshot>
