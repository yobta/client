import { YobtaSubscribe, YOBTA_SUBSCRIBE } from '@yobta/protocol'

import { createOperation } from '../createOperation/createOperation.js'
import { YobtaLog } from '../log/log.js'

interface SubscribeOperationGetter {
  (channel: string, committed: YobtaLog): YobtaSubscribe
}

export const getSubscribeOperation: SubscribeOperationGetter = (
  channel,
  committed,
) => {
  let version = 0
  for (const op of committed.values()) version = op.committed
  const message = createOperation<YobtaSubscribe>({
    id: `${channel}/subscribe`,
    channel,
    type: YOBTA_SUBSCRIBE,
    version,
  })

  return message
}
