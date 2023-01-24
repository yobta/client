import { YobtaDataOperation } from '@yobta/protocol';
import { Subscription } from './subscriptions.js';
interface GetSubscription {
    (channel: string, committedOperations: YobtaDataOperation[]): Subscription;
}
export declare const getSubscription: GetSubscription;
export {};
//# sourceMappingURL=getSubscription.d.ts.map