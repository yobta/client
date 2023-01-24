import { nanoid } from 'nanoid'
import { YobtaAnyOperation, YobtaOperationId } from '@yobta/protocol'

import { getServerTime } from '../serverTime/serverTime.js'

type PartialOperartion<Operation extends YobtaAnyOperation> = Omit<
  Operation,
  'id' | 'time'
> & { id?: YobtaOperationId; time?: number }

interface YobtaOperationFactory {
  <Operation extends YobtaAnyOperation>(
    partialOperation: PartialOperartion<Operation>,
  ): Operation
}

export const createOperationYobta: YobtaOperationFactory = <
  Operation extends YobtaAnyOperation,
>(
  partialOperation: PartialOperartion<Operation>,
): Operation => {
  return {
    id: nanoid(),
    time: getServerTime(),
    ...partialOperation,
  } as Operation
}
