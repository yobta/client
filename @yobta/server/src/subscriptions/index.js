const subscriptions = new WeakMap();
export const subscribe = (ws, channel) => {
    let subs = subscriptions.get(ws) || {};
    subs[channel] = (subs[channel] || 0) + 1;
    subscriptions.set(ws, subs);
};
export const unsubscribe = (ws, channel) => {
    let subs = subscriptions.get(ws) || {};
    let next = (subs[channel] || 0) - 1;
    if (next > 0) {
        subs[channel] = next;
    }
    else {
        delete subs[channel];
    }
    subscriptions.set(ws, subs);
};
