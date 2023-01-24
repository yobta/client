import { logYobta } from '../log/log.js';
import { subscriptionsStore } from './subscriptions.js';
export const getSubscription = (channel, committedOperations) => {
    let subscription = subscriptionsStore.get(channel);
    if (!subscription) {
        subscription = {
            subscribers: new Set(),
            committed: logYobta(committedOperations),
            pending: logYobta([]),
        };
        subscriptionsStore.set(channel, subscription);
    }
    return subscription;
};
