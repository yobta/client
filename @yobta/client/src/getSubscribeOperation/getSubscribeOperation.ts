import { YobtaSubscribeOperation, YOBTA_SUBSCRIBE } from '@yobta/protocol'

import { createOperation } from '../createOperation/createOperation.js'

interface SubscribeOperationGetter {
  (channel: string, version: number): YobtaSubscribeOperation
}

export const getSubscribeOperation: SubscribeOperationGetter = (
  channel,
  version,
) => {
  const operation = createOperation<YobtaSubscribeOperation>({
    id: `${channel}/subscribe`,
    channel,
    type: YOBTA_SUBSCRIBE,
    version,
  })
  return operation
}
