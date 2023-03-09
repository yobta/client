import { YobtaCollectionAnySnapshot } from './collection.js'
import { YobtaDataOperation, YobtaOperationId } from './unsorted.js'

export type YobtaClientOperation<Snapshot extends YobtaCollectionAnySnapshot> =
  | YobtaDataOperation<Snapshot>
  | YobtaSubscribeOperation
  | YobtaUnsubscribeOperation

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
  version: number
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
