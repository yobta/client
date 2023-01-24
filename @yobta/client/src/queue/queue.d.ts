import { YobtaOperationId, YobtaClientOperation, YobtaReceived } from '@yobta/protocol';
type State = Map<YobtaOperationId, YobtaClientOperation>;
export declare const operationsQueue: State;
export declare const observeQueue: (observer: (state: Readonly<YobtaClientOperation>, ...overloads: any[]) => void) => VoidFunction;
export declare const queueOperation: (operation: YobtaClientOperation) => void;
export declare const dequeueOperationAndFixTime: (operation: YobtaReceived) => void;
export {};
//# sourceMappingURL=queue.d.ts.map