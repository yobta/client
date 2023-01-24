import { YobtaDataOperation, YobtaOperationId } from '@yobta/protocol';
interface YobtaLogFactory {
    (initialState: YobtaDataOperation[]): {
        add(...operations: YobtaDataOperation[]): void;
        values: Log['values'];
        remove(operationId: YobtaOperationId): YobtaDataOperation | undefined;
        last(): YobtaDataOperation | undefined;
        version: symbol;
    };
}
type Log = Map<YobtaOperationId, YobtaDataOperation>;
export type YobtaLog = ReturnType<YobtaLogFactory>;
export declare const logYobta: YobtaLogFactory;
export {};
//# sourceMappingURL=log.d.ts.map