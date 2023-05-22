import {
  YobtaChannelDeleteOperation,
  YobtaChannelShiftOperation,
  YobtaChannelRestoreOperation,
  YobtaChannelInsertOperation,
} from './channel.js'
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionCreateOperation,
  YobtaCollectionRevalidateOperation,
  YobtaCollectionUpdateOperation,
} from './collection.js'
import { Prettify, YobtaOperationId } from './unsorted.js'

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
  data?: never
  reason: string
  operationId: YobtaOperationId
  snapshotId?: never
  nextSnapshotId?: never
  type: typeof YOBTA_REJECT
  committed: number
  merged: number
}

export const YOBTA_BATCH = 'yobta-batch'
export type YobtaBatchedOperation<Snapshot extends YobtaCollectionAnySnapshot> =
  Prettify<
    | YobtaCollectionRevalidateOperation<Snapshot>
    | YobtaChannelDeleteOperation
    | YobtaChannelRestoreOperation
    | YobtaChannelShiftOperation
  >

export type YobtaBatchOperation<Snapshot extends YobtaCollectionAnySnapshot> = {
  id: YobtaOperationId
  channel: string
  committed?: never
  merged?: never
  type: typeof YOBTA_BATCH
  data: YobtaBatchedOperation<Snapshot>[]
  snapshotId?: never
}

export type YobtaServerOperation<Snapshot extends YobtaCollectionAnySnapshot> =
  | YobtaReceived
  | YobtaRejectOperation
  | YobtaCollectionCreateOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionRevalidateOperation<Snapshot>
  | YobtaBatchOperation<Snapshot>
  | YobtaChannelInsertOperation
  | YobtaChannelDeleteOperation
  | YobtaChannelRestoreOperation
  | YobtaChannelShiftOperation

export type YobtaServerDataOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> =
  | YobtaCollectionCreateOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionRevalidateOperation<Snapshot>
  | YobtaChannelInsertOperation
  | YobtaChannelDeleteOperation
  | YobtaChannelRestoreOperation
  | YobtaChannelShiftOperation
