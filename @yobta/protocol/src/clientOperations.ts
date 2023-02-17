import { YobtaDataOperation, YobtaOperationId } from './unsorted.js'

export type YobtaClientOperation =
  | YobtaDataOperation
  | YobtaSubscribe
  | YobtaUnsubscribe

export const YOBTA_ERROR = 'yobta-error'
export type YobtaError = {
  id: YobtaOperationId
  committed: number
  type: typeof YOBTA_ERROR
  message: string
}

export const YOBTA_SUBSCRIBE = 'yobta-subscribe'
export type YobtaSubscribe = {
  id: YobtaOperationId
  channel: string
  version: number
  committed: number
  type: typeof YOBTA_SUBSCRIBE
}

export const YOBTA_UNSUBSCRIBE = 'yobta-unsubscribe'
export type YobtaUnsubscribe = {
  id: YobtaOperationId
  channel: string
  committed: number
  type: typeof YOBTA_UNSUBSCRIBE
}
