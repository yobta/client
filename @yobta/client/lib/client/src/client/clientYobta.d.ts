import { YobtaOnlineStore } from '@yobta/stores';
import { YobtaTransport } from '../websocketYobta/websocketYobta.js';
import { YobtaClientEncoder } from '../encoder/encoder.js';
interface ClientFactory {
    (config: {
        transport: YobtaTransport;
        encoder?: YobtaClientEncoder;
        internetObserver: YobtaOnlineStore;
        getHeaders?: () => Record<string, string>;
        messageTimeoutMs?: number;
    }): () => VoidFunction;
}
export type CrosstabYobta = ReturnType<ClientFactory>;
export declare const clientYobta: ClientFactory;
export {};
//# sourceMappingURL=clientYobta.d.ts.map