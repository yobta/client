import { YobtaCollectionItem, YobtaCollectionId } from '@yobta/protocol';
import { YobtaLog } from '../log/log.js';
interface MergeLog {
    <State extends YobtaCollectionItem>(state: Map<YobtaCollectionId, SnapshotValue<State>>, log: YobtaLog): void;
}
export type Snapshot<State extends YobtaCollectionItem> = Map<YobtaCollectionId, SnapshotValue<State>>;
type SnapshotValue<State extends YobtaCollectionItem> = {
    data: State;
    deleted: boolean;
};
export declare const mergeLog: MergeLog;
export {};
//# sourceMappingURL=mergeLog.d.ts.map