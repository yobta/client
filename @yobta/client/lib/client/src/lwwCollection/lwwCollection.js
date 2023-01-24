import { storeYobta, YOBTA_IDLE, YOBTA_READY } from '@yobta/stores';
import { nanoid } from 'nanoid';
import { YOBTA_COLLECTION_INSERT, YOBTA_COLLECTION_DELETE, YOBTA_COLLECTION_UPDATE, } from '@yobta/protocol';
import { operationResult } from '../operationResult/operationResult.js';
import { createOperationYobta } from '../createOperation/createOperation.js';
import { getSubscription } from '../subscriptions/getSubscription.js';
import { subscribe } from '../subscriptions/subscribe.js';
import { createCollectionSnapshot } from './createCollectionSnapshot.js';
import { plainObjectDiff } from '../plainObjectDiff/plainObjectDiff.js';
import { handleDataOperation } from '../subscriptions/handleDataOperation.js';
export const lwwCollection = ({ channel, operations = [], }) => {
    let unsubscribe;
    let { next, last, observe, on } = storeYobta(new Map(), ({ addMiddleware }) => {
        addMiddleware(YOBTA_READY, () => {
            let subscription = getSubscription(channel, operations);
            let snapshot = createCollectionSnapshot();
            unsubscribe = subscribe(channel, logs => {
                let state = snapshot.next(logs);
                next(state);
            });
            return snapshot.next(subscription);
        });
        addMiddleware(YOBTA_IDLE, state => {
            unsubscribe();
            return state;
        });
    });
    return {
        async update(ref, unfiltereledData) {
            let item = last().get(ref);
            // TODO: throw error if item not found
            if (!item)
                return;
            let data = plainObjectDiff(item, unfiltereledData);
            if (!data)
                return;
            let operation = createOperationYobta({
                channel,
                type: YOBTA_COLLECTION_UPDATE,
                data,
                ref,
            });
            handleDataOperation(operation);
            return operationResult(operation.id);
        },
        async delete(ref) {
            // NOTE: delete should not throw error if item not found
            let operation = createOperationYobta({
                channel,
                type: YOBTA_COLLECTION_DELETE,
                ref,
            });
            handleDataOperation(operation);
            return operationResult(operation.id);
        },
        insert(item, ref) {
            let data = {
                id: nanoid(),
                ...item,
            };
            // TODO: throw error if ref not found
            let operation = createOperationYobta({
                channel,
                type: YOBTA_COLLECTION_INSERT,
                data,
                ref,
            });
            handleDataOperation(operation);
            return operationResult(operation.id);
        },
        last,
        observe,
        on,
    };
};
