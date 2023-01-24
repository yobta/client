import { mapYobta } from '@yobta/stores';
export const yobtaErrorsStore = mapYobta({});
export const createErrorYobta = (error) => {
    yobtaErrorsStore.assign({ [error.message]: error });
};
export const removeYobtaError = (error) => {
    yobtaErrorsStore.omit([error.message]);
};
