import { YobtaCollectionId } from './collection.js'
import { YobtaOperationId } from './unsorted.js'

export const YOBTA_COLLECTION_DELETE = 'yobta-collection-delete'
export type YobtaCollectionDeleteOperation = {
  id: YobtaOperationId
  type: typeof YOBTA_COLLECTION_DELETE
  channel: string
  data?: never
  snapshotId: YobtaCollectionId
  nextSnapshotId?: never
  operationId?: never
  committed: number
  merged: number
}

export const YOBTA_COLLECTION_RESTORE = 'yobta-collection-restore'
export type YobtaCollectionRestoreOperation = {
  id: YobtaOperationId
  type: typeof YOBTA_COLLECTION_RESTORE
  channel: string
  data?: never
  snapshotId: YobtaCollectionId
  nextSnapshotId?: never
  operationId?: never
  committed: number
  merged: number
}

export const YOBTA_COLLECTION_SHIFT = 'yobta-collection-shift'
export type YobtaCollectionShiftOperation = {
  id: YobtaOperationId
  type: typeof YOBTA_COLLECTION_SHIFT
  channel: string
  data?: never
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  operationId?: never
  committed: number
  merged: number
}
