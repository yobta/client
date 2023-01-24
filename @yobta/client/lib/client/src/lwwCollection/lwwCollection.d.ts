import { YobtaStore } from '@yobta/stores';
import { YobtaCollectionItem, YobtaCollectionId, YobtaDataOperation } from '@yobta/protocol';
type Collection<State> = Map<YobtaCollectionId, State>;
type Data<State> = Omit<State, 'id'>;
type Payload<State> = Partial<Data<State>>;
interface LWWCollection {
    <State extends YobtaCollectionItem>(props: {
        channel: string;
        operations?: YobtaDataOperation[];
    }): {
        update: (id: YobtaCollectionId, data: Payload<State>) => Promise<void>;
        delete: (id: YobtaCollectionId) => Promise<void>;
        insert: (data: Data<State>, before?: YobtaCollectionId) => Promise<void>;
        last(): Collection<State>;
    } & Omit<YobtaStore<Collection<State>>, 'next'>;
}
export declare const lwwCollection: LWWCollection;
export {};
//# sourceMappingURL=lwwCollection.d.ts.map