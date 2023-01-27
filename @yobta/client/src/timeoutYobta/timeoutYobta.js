export const timeoutYobta = () => {
    let heap = new Map();
    let stop = (callback) => {
        clearTimeout(heap.get(callback));
        heap.delete(callback);
    };
    return {
        start(callback, timeout, ...overloads) {
            if (!heap.has(callback)) {
                let timeoutId = setTimeout(() => {
                    callback(...overloads);
                    stop(callback);
                }, timeout);
                heap.set(callback, timeoutId);
            }
        },
        stop,
        stopAll() {
            heap.forEach((_, callback) => {
                stop(callback);
            });
        },
    };
};
