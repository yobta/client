import { mergeOperation } from './mergeOperation.js';
import { mergeLog } from './mergeLog.js';
export const createCollectionSnapshot = () => {
    let version;
    let state = new Map();
    return {
        next({ committed: commited, pending }) {
            if (version !== commited.version) {
                let op = commited.last();
                if (op) {
                    // note: an operation can be applied multiple times, but the result will be the same
                    mergeOperation(state, op);
                }
                else {
                    state = new Map();
                    mergeLog(state, commited);
                }
                version = commited.version;
            }
            let pendingState = new Map(state);
            mergeLog(pendingState, pending);
            let result = new Map();
            pendingState.forEach((value, key) => {
                if (!value.deleted)
                    result.set(key, value.data);
            });
            return result;
        },
    };
};
