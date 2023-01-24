import { YobtaLog } from '../log/log.js'

export type Subscriber = (props: {
  committed: YobtaLog
  pending: YobtaLog
}) => void

export type Subscription = {
  subscribers: Set<Subscriber>
  committed: YobtaLog
  pending: YobtaLog
}

export const subscriptionsStore = new Map<string, Subscription>()
