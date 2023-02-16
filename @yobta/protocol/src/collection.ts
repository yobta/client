import { YobtaJsonValue } from '@yobta/stores'
import { YobtaOperationId } from './unsorted'

export type YobtaCollectionId = string | number
type Key = string | number

export type YobtaCollectionAnySnapshot = {
  id: YobtaCollectionId
  [key: Key]: YobtaJsonValue | undefined
}

export type PatchWithoutId<Snapshot extends YobtaCollectionAnySnapshot> =
  Partial<Omit<Snapshot, 'id'>>
export type PatchWithId<Snapshot extends YobtaCollectionAnySnapshot> =
  PatchWithoutId<Snapshot> & {
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
  ref: YobtaCollectionId
  before?: YobtaCollectionId
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
  data: PatchWithoutId<Snapshot>
  ref: YobtaCollectionId
  before?: never
  committed: number
  merged: number
}
export type YobtaCollectionOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
  Patched extends YobtaCollectionAnySnapshot = PatchWithId<Snapshot>,
> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Patched>
