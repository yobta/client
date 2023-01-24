import { Subscription } from './subscriptions.js'

export const notifySubscribers = ({
  subscribers,
  committed,
  pending,
}: Subscription): void => {
  subscribers.forEach(subscriber => {
    subscriber({ committed, pending })
  })
}
