import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionInsertOperation,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionUpdateOperation,
} from './collection.js'
import { YobtaOperationId } from './unsorted.js'

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

export type YobtaServerOperation<Snapshot extends YobtaCollectionAnySnapshot> =
  | YobtaReceived
  | YobtaRejectOperation
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionRevalidateOperation<Snapshot>

export type YobtaServerDataOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionRevalidateOperation<Snapshot>
