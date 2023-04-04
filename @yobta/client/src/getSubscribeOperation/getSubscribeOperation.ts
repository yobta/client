import { YobtaSubscribeOperation, YOBTA_SUBSCRIBE } from '@yobta/protocol'

import { createOperation } from '../createOperation/createOperation.js'

interface SubscribeOperationGetter {
  (channel: string, merged: number): YobtaSubscribeOperation
}

export const getSubscribeOperation: SubscribeOperationGetter = (
  channel,
  merged,
) => {
  const operation = createOperation<YobtaSubscribeOperation>({
    id: `${channel}/subscribe`,
    channel,
    type: YOBTA_SUBSCRIBE,
    merged,
  })
  return operation
}
