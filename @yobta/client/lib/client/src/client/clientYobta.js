import { connectionStore, YOBTA_OPEN, } from '../connectionStore/connectionStore.js';
import { timeoutYobta } from '../timeoutYobta/timeoutYobta.js';
import { operationsQueue, observeQueue } from '../queue/queue.js';
import { isMainTab, mainStore } from '../mainStore/mainStore.js';
import { encoderYobta } from '../encoder/encoder.js';
import { handleRemoteOperation } from '../subscriptions/handleRemoteOperation.js';
import { getAllSubscribeOperarions } from '../subscriptions/getAllSubscribeOperarions.js';
import { remoteStore } from '../remoteStore/remoteStore.js';
const BEFORE_UNLOAD = 'beforeunload';
export const clientYobta = ({ transport, encoder = encoderYobta(), internetObserver, getHeaders, messageTimeoutMs = 3600, }) => {
    let connection = null;
    let timer = timeoutYobta();
    let connect = () => {
        if (!connection && isMainTab() && internetObserver.last()) {
            connection = transport({
                onMessage(message) {
                    let decoded = encoder.decode(message);
                    remoteStore.next(decoded);
                    timer.stopAll();
                },
                onStatus: connectionStore.next,
            });
        }
    };
    let disconnect = () => {
        if (connection) {
            connection.close();
            connection = null;
        }
    };
    let reconnect = () => {
        disconnect();
        connect();
    };
    let send = (operation) => {
        if (connection === null || connection === void 0 ? void 0 : connection.isOpen()) {
            let encoded = encoder.encode({
                headers: getHeaders === null || getHeaders === void 0 ? void 0 : getHeaders(),
                operation,
            });
            connection.send(encoded);
            timer.start(reconnect, messageTimeoutMs);
        }
    };
    return () => {
        let unmount = [
            connectionStore.observe(state => {
                timer.stopAll();
                if (state === YOBTA_OPEN) {
                    ;
                    [
                        ...operationsQueue.values(),
                        ...getAllSubscribeOperarions(),
                    ].forEach(send);
                }
                else {
                    timer.start(reconnect, 2000);
                }
                !isMainTab() && disconnect();
            }),
            observeQueue(send),
            internetObserver.observe(hasInternet => {
                hasInternet ? reconnect() : disconnect();
            }),
            mainStore.observe(isMain => {
                isMain ? connect() : disconnect();
            }),
            remoteStore.observe(handleRemoteOperation),
        ];
        let teardown = () => {
            disconnect();
            timer.stopAll();
            unmount.forEach(u => {
                u();
            });
            window.removeEventListener(BEFORE_UNLOAD, teardown);
        };
        window.addEventListener(BEFORE_UNLOAD, teardown);
        return teardown;
    };
};
