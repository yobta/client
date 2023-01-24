export type YOBTA_CONNECTION_STATE = typeof YOBTA_CONNECTING | typeof YOBTA_OPEN | typeof YOBTA_CLOSING | typeof YOBTA_CLOSED | typeof YOBTA_CONNECTION_ERROR;
export declare const YOBTA_CONNECTING = "CONNECTING";
export declare const YOBTA_OPEN = "OPEN";
export declare const YOBTA_CLOSING = "CLOSING";
export declare const YOBTA_CLOSED = "CLOSED";
export declare const YOBTA_CONNECTION_ERROR = "ERROR";
export declare const connectionStore: import("@yobta/stores").YobtaStore<YOBTA_CONNECTION_STATE, any[]>;
//# sourceMappingURL=connectionStore.d.ts.map