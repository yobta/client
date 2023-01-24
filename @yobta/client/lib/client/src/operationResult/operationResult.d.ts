import { YobtaCommit, YobtaOperationId, YobtaReject } from '@yobta/protocol';
interface OperationResultPromiseFactory {
    (operationId: YobtaOperationId): Promise<void>;
}
type Observer = (operation: YobtaCommit | YobtaReject) => void;
export declare const operationResultObservers: Set<Observer>;
export declare const notifyOperationObservers: (operation: YobtaCommit | YobtaReject) => void;
export declare const operationResult: OperationResultPromiseFactory;
export {};
//# sourceMappingURL=operationResult.d.ts.map