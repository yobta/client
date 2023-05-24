import { YobtaCollectionId } from './collection.js'
import { YobtaOperationId } from './unsorted.js'

export const YOBTA_CHANNEL_INSERT = 'yobta-channel-insert'
export type YobtaChannelInsertOperation = {
  id: YobtaOperationId
  type: typeof YOBTA_CHANNEL_INSERT
  channel: string
  data?: never
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  operationId?: never
  committed: number
  merged: number
}

export const YOBTA_CHANNEL_DELETE = 'yobta-channel-delete'
export type YobtaChannelDeleteOperation = {
  id: YobtaOperationId
  type: typeof YOBTA_CHANNEL_DELETE
  channel: string
  data?: never
  snapshotId: YobtaCollectionId
  nextSnapshotId?: never
  operationId?: never
  committed: number
  merged: number
}

export const YOBTA_CHANNEL_RESTORE = 'yobta-channel-restore'
export type YobtaChannelRestoreOperation = {
  id: YobtaOperationId
  type: typeof YOBTA_CHANNEL_RESTORE
  channel: string
  data?: never
  snapshotId: YobtaCollectionId
  nextSnapshotId?: never
  operationId?: never
  committed: number
  merged: number
}

export const YOBTA_CHANNEL_SHIFT = 'yobta-channel-shift'
export type YobtaChannelShiftOperation = {
  id: YobtaOperationId
  type: typeof YOBTA_CHANNEL_SHIFT
  channel: string
  data?: never
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  operationId?: never
  committed: number
  merged: number
}

export type YobtaChannelOperation =
  | YobtaChannelDeleteOperation
  | YobtaChannelInsertOperation
  | YobtaChannelRestoreOperation
  | YobtaChannelShiftOperation
