import { YobtaJsonValue } from '@yobta/stores'

import { Prettify, YobtaOperationId } from './unsorted.js'
import {
  YobtaChannelDeleteOperation,
  YobtaChannelShiftOperation,
  YobtaChannelRestoreOperation,
  YobtaChannelInsertOperation,
} from './channel.js'

export type YobtaCollectionId = string
export type YobtaCollectionSnapshotKey = string

export type YobtaCollectionAnySnapshot = {
  id: YobtaCollectionId
  [key: YobtaCollectionSnapshotKey]: YobtaJsonValue | undefined
}

export type YobtaCollectionPatchWithoutId<
  Snapshot extends YobtaCollectionAnySnapshot,
> = Partial<Omit<Snapshot, 'id'>>
export type YobtaCollectionPatchWithId<
  Snapshot extends YobtaCollectionAnySnapshot,
> = YobtaCollectionPatchWithoutId<Snapshot> & {
  id: YobtaCollectionId
}

export const YOBTA_COLLECTION_CREATE = 'yobta-collection-create'
export type YobtaCollectionCreateOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  id: YobtaOperationId
  type: typeof YOBTA_COLLECTION_CREATE
  channel: string
  data: Snapshot
  snapshotId?: never
  nextSnapshotId?: never
  operationId?: never
  committed: number
  merged: number
}

export const YOBTA_COLLECTION_UPDATE = 'yobta-collection-update'
export type YobtaCollectionUpdateOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  id: YobtaOperationId
  type: typeof YOBTA_COLLECTION_UPDATE
  channel: string
  data: YobtaCollectionPatchWithId<Snapshot>
  snapshotId?: never
  nextSnapshotId?: never
  operationId?: never
  committed: number
  merged: number
}

export type YobtaCollectionTuple<Snapshot extends YobtaCollectionAnySnapshot> =
  {
    [Key in keyof Snapshot]: [Key, Snapshot[Key], number, number]
  }[keyof Snapshot]

export const YOBTA_COLLECTION_REVALIDATE = 'yobta-collection-revalidate'
export type YobtaCollectionRevalidateOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  id: YobtaOperationId
  type: typeof YOBTA_COLLECTION_REVALIDATE
  channel: string
  data: YobtaCollectionTuple<Snapshot>[]
  snapshotId: YobtaCollectionId
  committed: number
  merged: number
  nextSnapshotId?: never
  operationId?: never
}

export type YobtaCollectionOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> = Prettify<
  | YobtaCollectionCreateOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaChannelInsertOperation
  | YobtaChannelDeleteOperation
  | YobtaChannelRestoreOperation
  | YobtaChannelShiftOperation
>
