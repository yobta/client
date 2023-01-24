import { queueOperation } from '../queue/queue.js';
import { notifySubscribers } from './notifySubscribers.js';
import { subscriptionsStore } from './subscriptions.js';
export const handleDataOperation = operation => {
    let subscription = subscriptionsStore.get(operation.channel);
    if (subscription) {
        subscription.pending.add(operation);
        notifySubscribers(subscription);
    }
    queueOperation(operation);
};
