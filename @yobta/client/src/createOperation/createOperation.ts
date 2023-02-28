import { nanoid } from 'nanoid'
import { YobtaAnyOperation, YobtaOperationId } from '@yobta/protocol'

import { getServerTime } from '../serverTime/serverTime.js'

type PartialOperartion<Operation extends YobtaAnyOperation> = Omit<
  Operation,
  'id' | 'committed' | 'merged'
> & { id?: YobtaOperationId; committed?: number; merged?: number }

interface YobtaOperationFactory {
  <Operation extends YobtaAnyOperation>(
    partialOperation: PartialOperartion<Operation>,
  ): Operation
}

export const createOperation: YobtaOperationFactory = <
  Operation extends YobtaAnyOperation,
>(
  partialOperation: PartialOperartion<Operation>,
): Operation => {
  return {
    id: nanoid(),
    committed: getServerTime(),
    merged: 0,
    ...partialOperation,
  } as Operation
}
