type ID = string | number;
type AnyItem = {
    id: ID;
    [key: string | number]: any;
};
type YobtaJsonValue = string | number | boolean | null | {
    [property: string | number]: YobtaJsonValue;
} | YobtaJsonValue[];
type Collection<Item extends AnyItem> = {
    insert(item: Item, before?: Item['id']): Promise<void>;
    update(id: string, item: Partial<Item>): Promise<void>;
    delete(id: string): Promise<void>;
    observe(callback: (items: ReadonlyMap<ID, Readonly<Item>>) => void): VoidFunction;
};
interface CollectionFactory {
    <Item extends AnyItem>(name: string): Collection<Item>;
}
type QueryResult<Item extends AnyItem> = ReadonlyArray<Readonly<Item>>;
interface QueryFactory {
    <Item extends AnyItem>(props: {
        collection: Collection<Item>;
        name: string;
    }): (config: {
        name: string;
        params: Record<string | number, YobtaJsonValue>;
    }) => {
        insert(item: Item, before?: Item['id']): Promise<void>;
        update(id: string, item: Partial<Item>): Promise<void>;
        delete(id: string): Promise<void>;
        observe(callback: (items: QueryResult<Item>) => void): VoidFunction;
        last(): QueryResult<Item>;
    };
}
//# sourceMappingURL=mode.d.ts.map