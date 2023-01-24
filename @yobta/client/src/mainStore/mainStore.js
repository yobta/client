import { storeEffectYobta, storeYobta } from '@yobta/stores';
import { intervalYobta } from '../intervalYobta/intervalYobta.js';
import { timeoutYobta } from '../timeoutYobta/timeoutYobta.js';
const PING = 'PING';
const PONG = 'PONG';
const HONK = 'HONK';
let channel = null;
const interval = intervalYobta();
const timeout = timeoutYobta();
const post = (message) => {
    channel === null || channel === void 0 ? void 0 : channel.postMessage(message);
};
const setMain = () => {
    mainStore.next(true);
    post(PONG);
};
const ping = () => {
    if (!isMainTab()) {
        post(PING);
        timeout.start(setMain, 64);
    }
};
const pong = () => {
    if (isMainTab()) {
        post(PONG);
    }
};
const honk = () => {
    post(HONK);
};
export const mainStore = storeYobta(false);
storeEffectYobta(mainStore, () => {
    channel = new BroadcastChannel('yobta-main-tab');
    channel.onmessage = ({ data }) => {
        switch (data) {
            case PING:
                pong();
                break;
            case PONG:
                if (isMainTab()) {
                    mainStore.next(false);
                }
                timeout.stop(setMain);
                break;
            default:
                ping();
                break;
        }
    };
    ping();
    interval.start(ping, 1000 * 3);
    window.addEventListener('beforeunload', honk);
    return () => {
        interval.stopAll();
        timeout.stopAll();
        channel === null || channel === void 0 ? void 0 : channel.close();
        channel = null;
        window.removeEventListener('beforeunload', honk);
    };
});
export const isMainTab = () => {
    let isMain = mainStore.last();
    return isMain;
};
