import { nanoid } from 'nanoid';
import { getServerTime } from '../serverTime/serverTime.js';
export const createOperationYobta = (partialOperation) => {
    return {
        id: nanoid(),
        time: getServerTime(),
        ...partialOperation,
    };
};
