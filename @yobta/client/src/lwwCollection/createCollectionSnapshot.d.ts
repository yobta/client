import { YobtaCollectionItem, YobtaCollectionId } from '@yobta/protocol';
import { YobtaLog } from '../log/log.js';
interface YobtaCollectionSnapshotFactory {
    <State extends YobtaCollectionItem>(): {
        next(logs: {
            committed: YobtaLog;
            pending: YobtaLog;
        }): Map<YobtaCollectionId, State>;
    };
}
export declare const createCollectionSnapshot: YobtaCollectionSnapshotFactory;
export {};
//# sourceMappingURL=createCollectionSnapshot.d.ts.map