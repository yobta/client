export const logYobta = initialState => {
    let version = Symbol();
    let log = new Map();
    let lastOperationId;
    let wasSorted = true;
    let append = (op) => {
        log.set(op.id, op);
        lastOperationId = op.id;
    };
    let add = (...operations) => {
        operations.forEach(op => {
            var _a;
            let tail = new Set();
            wasSorted = false;
            if (Number((_a = log.get(lastOperationId)) === null || _a === void 0 ? void 0 : _a.time) > op.time) {
                log.forEach(stored => {
                    if (stored.time > op.time) {
                        tail.add(stored);
                        log.delete(stored.id);
                    }
                });
                wasSorted = true;
            }
            append(op);
            tail.forEach(append);
        });
        version = Symbol();
        if (operations.length > 1)
            wasSorted = true;
    };
    add(...initialState);
    return {
        add,
        get version() {
            return version;
        },
        values: () => log.values(),
        last() {
            return wasSorted ? undefined : log.get(lastOperationId);
        },
        remove(operationId) {
            let op = log.get(operationId);
            log.delete(operationId);
            wasSorted = true;
            version = Symbol();
            return op;
        },
    };
};
