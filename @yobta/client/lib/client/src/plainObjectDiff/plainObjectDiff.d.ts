import { YobtaAnyPlainObject } from '@yobta/stores';
interface PlainObjectDiff {
    <PlainObject extends YobtaAnyPlainObject>(oldObject: YobtaAnyPlainObject, newObject: Partial<PlainObject>): Partial<PlainObject> | null;
}
export declare const plainObjectDiff: PlainObjectDiff;
export {};
//# sourceMappingURL=plainObjectDiff.d.ts.map