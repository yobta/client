import { YobtaLog } from '../log/log.js';
export type Subscriber = (props: {
    committed: YobtaLog;
    pending: YobtaLog;
}) => void;
export type Subscription = {
    subscribers: Set<Subscriber>;
    committed: YobtaLog;
    pending: YobtaLog;
};
export declare const subscriptionsStore: Map<string, Subscription>;
//# sourceMappingURL=subscriptions.d.ts.map