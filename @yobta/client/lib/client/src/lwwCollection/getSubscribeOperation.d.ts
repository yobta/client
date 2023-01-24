import { YobtaSubscribe } from '@yobta/protocol';
import { YobtaLog } from '../log/log.js';
interface SubscribeOperationGetter {
    (channel: string, committed: YobtaLog): YobtaSubscribe;
}
export declare const getSubscribeOperation: SubscribeOperationGetter;
export {};
//# sourceMappingURL=getSubscribeOperation.d.ts.map