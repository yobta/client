import { YobtaCollectionItem, YobtaDataOperation } from '@yobta/protocol';
import { Snapshot } from './mergeLog.js';
/**
 * Merges an operation into a State object.
 *
 * @template State
 * @param {Snapshot<State>} state - The YobtaLwwCollectionData object to merge the operation into.
 * @param {YobtaDataOperation} operation - The operation to merge into the state.
 */
export declare const mergeOperation: <State extends YobtaCollectionItem>(state: Snapshot<State>, operation: YobtaDataOperation) => void;
//# sourceMappingURL=mergeOperation.d.ts.map