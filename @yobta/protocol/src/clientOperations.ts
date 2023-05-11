import { YobtaJsonValue } from '@yobta/stores'

import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionCreateOperation,
  YobtaCollectionUpdateOperation,
} from './collection.js'
import { Prettify, YobtaOperationId } from './unsorted.js'
import {
  YobtaChannelDeleteOperation,
  YobtaChannelShiftOperation,
  YobtaChannelRestoreOperation,
  YobtaChannelInsertOperation,
} from './channel.js'

export type YobtaClientOperation<Snapshot extends YobtaCollectionAnySnapshot> =
  Prettify<
    | YobtaCollectionCreateOperation<Snapshot>
    | YobtaCollectionUpdateOperation<Snapshot>
    | YobtaChannelInsertOperation
    | YobtaChannelDeleteOperation
    | YobtaChannelRestoreOperation
    | YobtaChannelShiftOperation
    | YobtaSubscribeOperation
    | YobtaUnsubscribeOperation
  >

export type YobtaClientDataOperation<
  Snapshot extends YobtaCollectionAnySnapshot,
> = Prettify<
  | YobtaCollectionCreateOperation<Snapshot>
  | YobtaCollectionUpdateOperation<Snapshot>
  | YobtaChannelInsertOperation
  | YobtaChannelDeleteOperation
  | YobtaChannelRestoreOperation
  | YobtaChannelShiftOperation
>

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
