import { YOBTA_COMMIT, YOBTA_REJECT, } from '@yobta/protocol';
export const operationResultObservers = new Set();
export const notifyOperationObservers = (operation) => {
    operationResultObservers.forEach(observer => {
        observer(operation);
    });
};
export const operationResult = operationId => new Promise((resolve, reject) => {
    let ovserver = operation => {
        if (operation.ref !== operationId)
            return;
        if (operation.type === YOBTA_COMMIT)
            resolve();
        if (operation.type === YOBTA_REJECT)
            reject(new Error(operation.reason));
        operationResultObservers.delete(ovserver);
    };
    operationResultObservers.add(ovserver);
});
