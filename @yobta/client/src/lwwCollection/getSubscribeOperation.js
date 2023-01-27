import { YOBTA_SUBSCRIBE } from '@yobta/protocol';
import { createOperationYobta } from '../createOperation/createOperation.js';
export const getSubscribeOperation = (channel, committed) => {
    let version = 0;
    for (let op of committed.values())
        version = op.time;
    let message = createOperationYobta({
        id: `${channel}/subscribe`,
        channel,
        type: YOBTA_SUBSCRIBE,
        version,
    });
    return message;
};
