import { YobtaSubscribe, YOBTA_SUBSCRIBE } from '@yobta/protocol'

import { createOperationYobta } from '../createOperation/createOperation.js'
import { YobtaLog } from '../log/log.js'

interface SubscribeOperationGetter {
  (channel: string, committed: YobtaLog): YobtaSubscribe
}

export const getSubscribeOperation: SubscribeOperationGetter = (
  channel,
  committed,
) => {
  let version = 0
  for (const op of committed.values()) version = op.time
  const message = createOperationYobta<YobtaSubscribe>({
    id: `${channel}/subscribe`,
    channel,
    type: YOBTA_SUBSCRIBE,
    version,
  })

  return message
}
