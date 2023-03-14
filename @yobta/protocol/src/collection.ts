import { YobtaJsonValue } from '@yobta/stores'

import { YobtaOperationId } from './unsorted.js'

export type YobtaCollectionId = string | number
export type YobtaCollectionSnapshotKey = string | number

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

export const YOBTA_COLLECTION_INSERT = 'yobta-collection-insert'
export type YobtaCollectionInsertOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  id: YobtaOperationId
  type: typeof YOBTA_COLLECTION_INSERT
  channel: string
  data: Snapshot
  snapshotId: YobtaCollectionId
  nextSnapshotId?: YobtaCollectionId
  operationId?: never
  committed: number
  merged: number
  deleted?: never
}

export const YOBTA_COLLECTION_UPDATE = 'yobta-collection-update'
export type YobtaCollectionUpdateOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  id: YobtaOperationId
  type: typeof YOBTA_COLLECTION_UPDATE
  channel: string
  data: YobtaCollectionPatchWithoutId<Snapshot>
  snapshotId: YobtaCollectionId
  nextSnapshotId?: never
  operationId?: never
  committed: number
  merged: number
  deleted?: never
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
  nextSnapshotId?: YobtaCollectionId
  operationId?: never
  committed: number
  merged: number
  deleted: boolean
}

export type YobtaCollectionOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
  Patched extends YobtaCollectionAnySnapshot = YobtaCollectionPatchWithId<Snapshot>,
> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Patched>
