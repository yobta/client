export const intervalYobta = () => {
    let heap = new Map();
    let stop = (callback) => {
        clearInterval(heap.get(callback));
        heap.delete(callback);
    };
    return {
        start(callback, timeout, ...overloads) {
            if (!heap.has(callback)) {
                let timeoutId = setInterval(callback, timeout, ...overloads);
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
