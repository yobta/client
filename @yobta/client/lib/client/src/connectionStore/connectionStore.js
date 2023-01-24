import { localStoragePluginYobta, storeYobta } from '@yobta/stores';
export const YOBTA_CONNECTING = 'CONNECTING';
export const YOBTA_OPEN = 'OPEN';
export const YOBTA_CLOSING = 'CLOSING';
export const YOBTA_CLOSED = 'CLOSED';
export const YOBTA_CONNECTION_ERROR = 'ERROR';
// #endregion
export const connectionStore = storeYobta(YOBTA_CLOSED, localStoragePluginYobta({
    channel: 'yobta-client-state',
}));
