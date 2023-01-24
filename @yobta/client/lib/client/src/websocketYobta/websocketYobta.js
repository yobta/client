import { YOBTA_CLOSED, YOBTA_CLOSING, YOBTA_CONNECTING, YOBTA_CONNECTION_ERROR, YOBTA_OPEN, } from '../connectionStore/connectionStore.js';
export const websocketYobta = ({ url, protocols, debug }) => ({ onMessage, onStatus }) => {
    onStatus(YOBTA_CONNECTING);
    let client = new WebSocket(url, protocols);
    let senDebug = (event) => {
        if (debug) {
            debug(event);
        }
    };
    client.onopen = event => {
        onStatus(YOBTA_OPEN);
        senDebug(event);
    };
    client.onclose = event => {
        onStatus(YOBTA_CLOSED);
        senDebug(event);
    };
    client.onerror = event => {
        onStatus(YOBTA_CONNECTION_ERROR);
        senDebug(event);
    };
    client.onmessage = event => {
        onMessage(event.data);
        senDebug(event);
    };
    return {
        isOpen: () => client.readyState === WebSocket.OPEN,
        close() {
            onStatus(YOBTA_CLOSING);
            client.close();
        },
        send(message) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        },
    };
};
