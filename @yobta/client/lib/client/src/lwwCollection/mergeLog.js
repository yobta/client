import { mergeOperation } from './mergeOperation.js';
export const mergeLog = (state, log) => {
    for (let operation of log.values())
        mergeOperation(state, operation);
};
