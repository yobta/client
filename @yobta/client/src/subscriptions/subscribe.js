import { YOBTA_UNSUBSCRIBE } from '@yobta/protocol';
import { createOperationYobta } from '../createOperation/createOperation.js';
import { getSubscribeOperation } from '../lwwCollection/getSubscribeOperation.js';
import { operationsQueue, queueOperation } from '../queue/queue.js';
import { getSubscription } from './getSubscription.js';
import { subscriptionsStore } from './subscriptions.js';
export const subscribe = (channel, callback) => {
    let subscription = getSubscription(channel, []);
    subscription.subscribers.add(callback);
    let operartion = getSubscribeOperation(channel, subscription.committed);
    queueOperation(operartion);
    return () => {
        subscription.subscribers.delete(callback);
        if (subscription.subscribers.size === 0) {
            subscriptionsStore.delete(channel);
            let unsubscribe = createOperationYobta({
                id: `${channel}/unsubscribe`,
                channel,
                type: YOBTA_UNSUBSCRIBE,
            });
            if (operationsQueue.has(operartion.id)) {
                operationsQueue.delete(operartion.id);
            }
            else {
                queueOperation(unsubscribe);
            }
        }
    };
};
