import { YOBTA_ERROR, } from '@yobta/protocol';
import { createOperationYobta } from '../createOperation/createOperation.js';
export const encoderYobta = () => {
    return {
        encode(value) {
            return JSON.stringify(value);
        },
        decode(value) {
            try {
                return JSON.parse(value);
            }
            catch (_) {
                let error = createOperationYobta({
                    type: YOBTA_ERROR,
                    message: String(value),
                });
                return error;
            }
        },
    };
};
