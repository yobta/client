import { broadcastChannelPluginYobta, storeYobta } from '@yobta/stores';
import { compensateTimeDifference } from '../serverTime/serverTime.js';
export const operationsQueue = new Map();
const channel = storeYobta({}, broadcastChannelPluginYobta({
    channel: 'yobta-client-op',
}));
export const observeQueue = channel.observe;
export const queueOperation = (operation) => {
    operationsQueue.set(operation.id, operation);
    channel.next(operation);
};
export const dequeueOperationAndFixTime = (operation) => {
    let clientOperation = operationsQueue.get(operation.ref);
    if (clientOperation) {
        compensateTimeDifference(clientOperation.time, operation.time);
    }
    operationsQueue.delete(operation.ref);
};
