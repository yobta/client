import { YOBTA_CONNECTION_STATE } from '../connectionStore/connectionStore.js';
interface TransportFactory {
    (config: {
        debug?: <Message>(event: Event | CloseEvent | MessageEvent<Message>) => void;
        protocols?: string | string[] | undefined;
        url: string | URL;
    }): (handlers: {
        onMessage(message: string): void;
        onStatus(action: YOBTA_CONNECTION_STATE): void;
    }) => {
        close(): void;
        isOpen(): boolean;
        send(message: string): void;
    };
}
export type YobtaTransport = ReturnType<TransportFactory>;
export type YobtaTransportConnection = ReturnType<YobtaTransport>;
export type YobtaTransportOnMessage = Parameters<YobtaTransport>[0]['onMessage'];
export type YobtaTransportOnStatus = Parameters<YobtaTransport>[0]['onStatus'];
export declare const websocketYobta: TransportFactory;
export {};
//# sourceMappingURL=websocketYobta.d.ts.map