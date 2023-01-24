import { YOBTA_COLLECTION_INSERT, YOBTA_COLLECTION_DELETE, YOBTA_COLLECTION_UPDATE, } from '@yobta/protocol';
/**
 * Merges an operation into a State object.
 *
 * @template State
 * @param {Snapshot<State>} state - The YobtaLwwCollectionData object to merge the operation into.
 * @param {YobtaDataOperation} operation - The operation to merge into the state.
 */
export const mergeOperation = (state, operation) => {
    switch (operation.type) {
        case YOBTA_COLLECTION_INSERT: {
            if (operation.ref) {
                let tail = new Map();
                let shouldCut = false;
                state.forEach((value, key) => {
                    if (key === operation.ref)
                        shouldCut = true;
                    if (shouldCut) {
                        tail.set(key, value);
                        state.delete(key);
                    }
                });
                state.set(operation.data.id, {
                    data: operation.data,
                    deleted: false,
                });
                tail.forEach((value, key) => {
                    state.set(key, value);
                });
            }
            else {
                state.set(operation.data.id, {
                    data: operation.data,
                    deleted: false,
                });
            }
            break;
        }
        case YOBTA_COLLECTION_DELETE: {
            let item = state.get(operation.ref);
            if (item) {
                state.set(operation.ref, { ...item, deleted: true });
            }
            break;
        }
        case YOBTA_COLLECTION_UPDATE: {
            let item = state.get(operation.ref);
            if (item) {
                let data = { ...item.data, ...operation.data };
                state.set(operation.ref, { ...item, data });
            }
            break;
        }
    }
};
