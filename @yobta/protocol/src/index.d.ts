export type YobtaOperationId = string;
export declare const YOBTA_RECEIVED = "received";
export type YobtaReceived = {
    id: YobtaOperationId;
    ref: YobtaOperationId;
    time: number;
    type: typeof YOBTA_RECEIVED;
};
export declare const YOBTA_COMMIT = "commit";
export type YobtaCommit = {
    id: YobtaOperationId;
    channel: string;
    ref: YobtaOperationId;
    time: number;
    type: typeof YOBTA_COMMIT;
};
export declare const YOBTA_REJECT = "reject";
export type YobtaReject = {
    id: YobtaOperationId;
    channel: string;
    reason: string;
    ref: YobtaOperationId;
    type: typeof YOBTA_REJECT;
    time: number;
};
export declare const YOBTA_COLLECTION_INSERT = "collection-insert";
export type YobtaCollectionId = string | number;
export type YobtaCollectionItem = {
    readonly id: YobtaCollectionId;
    readonly [key: string]: any;
};
export type YobtaCollectionInsert<Item extends YobtaCollectionItem> = {
    id: YobtaOperationId;
    channel: string;
    time: number;
    type: typeof YOBTA_COLLECTION_INSERT;
    data: Item;
    ref?: YobtaCollectionId;
};
export declare const YOBTA_COLLECTION_DELETE = "collection-delete";
export type YobtaCollectionDelete = {
    id: YobtaOperationId;
    channel: string;
    time: number;
    type: typeof YOBTA_COLLECTION_DELETE;
    ref: YobtaCollectionId;
};
export declare const YOBTA_COLLECTION_UPDATE = "collection-update";
export type YobtaCollectionUpdate<Item extends YobtaCollectionItem> = {
    id: YobtaOperationId;
    channel: string;
    time: number;
    type: typeof YOBTA_COLLECTION_UPDATE;
    data: Partial<Omit<Item, 'id'>>;
    ref: YobtaCollectionId;
};
export type YobtaDataOperation = YobtaCollectionInsert<YobtaCollectionItem> | YobtaCollectionUpdate<YobtaCollectionItem> | YobtaCollectionDelete;
export declare const YOBTA_BATCH = "batch";
export type YobtaBatchOperation = {
    id: YobtaOperationId;
    channel: string;
    type: typeof YOBTA_BATCH;
    operations: YobtaDataOperation[];
};
export type YobtaClientOperation = YobtaDataOperation | YobtaSubscribe | YobtaUnsubscribe;
export type YobtaRemoteOperation = YobtaReceived | YobtaCommit | YobtaReject | YobtaError | YobtaDataOperation | YobtaBatchOperation;
export declare const YOBTA_ERROR = "error";
export type YobtaError = {
    id: YobtaOperationId;
    time: number;
    type: typeof YOBTA_ERROR;
    message: string;
};
export declare const YOBTA_SUBSCRIBE = "subscribe";
export type YobtaSubscribe = {
    id: YobtaOperationId;
    channel: string;
    version: number;
    time: number;
    type: typeof YOBTA_SUBSCRIBE;
};
export declare const YOBTA_UNSUBSCRIBE = "unsubscribe";
export type YobtaUnsubscribe = {
    id: YobtaOperationId;
    channel: string;
    time: number;
    type: typeof YOBTA_UNSUBSCRIBE;
};
export type YobtaAnyOperation = YobtaReceived | YobtaCommit | YobtaReject | YobtaClientOperation | YobtaRemoteOperation;
//# sourceMappingURL=index.d.ts.map