import { YobtaJsonValue } from '@yobta/stores'

import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
} from './collection.js'
import { YobtaOperationId } from './unsorted.js'
import {
  YobtaCollectionDeleteOperation,
  YobtaCollectionShiftOperation,
  YobtaCollectionRestoreOperation,
} from './channel.js'

export type YobtaClientOperation<Snapshot extends YobtaCollectionAnySnapshot> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionDeleteOperation
  | YobtaCollectionRestoreOperation
  | YobtaCollectionShiftOperation
  | YobtaSubscribeOperation
  | YobtaUnsubscribeOperation

export type YobtaClientDataOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> =
  | YobtaCollectionInsertOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaCollectionDeleteOperation
  | YobtaCollectionRestoreOperation
  | YobtaCollectionShiftOperation

export const YOBTA_ERROR = 'yobta-error'
export type YobtaError = {
  id: YobtaOperationId
  committed: number
  type: typeof YOBTA_ERROR
  message: string
}

export const YOBTA_SUBSCRIBE = 'yobta-subscribe'
export type YobtaSubscribeOperation = {
  id: YobtaOperationId
  channel: string
  committed: number
  merged: number
  type: typeof YOBTA_SUBSCRIBE
}

export const YOBTA_UNSUBSCRIBE = 'yobta-unsubscribe'
export type YobtaUnsubscribeOperation = {
  id: YobtaOperationId
  channel: string
  committed: number
  type: typeof YOBTA_UNSUBSCRIBE
}

export type YobtaHeaders = Record<string, YobtaJsonValue>

export type YobtaClientMessage = {
  clientId: string
  headers: YobtaHeaders
  operation: YobtaClientOperation<YobtaCollectionAnySnapshot>
}
