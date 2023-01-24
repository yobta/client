import { YobtaAnyOperation, YobtaOperationId } from '@yobta/protocol';
type PartialOperartion<Operation extends YobtaAnyOperation> = Omit<Operation, 'id' | 'time'> & {
    id?: YobtaOperationId;
    time?: number;
};
interface YobtaOperationFactory {
    <Operation extends YobtaAnyOperation>(partialOperation: PartialOperartion<Operation>): Operation;
}
export declare const createOperationYobta: YobtaOperationFactory;
export {};
//# sourceMappingURL=createOperation.d.ts.map