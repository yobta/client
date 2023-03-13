import { YobtaClientMessage } from '@yobta/protocol'

interface YobtaServerParseClientMessage {
  (message: string): YobtaClientMessage
}

export const parseClientMessage: YobtaServerParseClientMessage = message => {
  const {
    headers,
    operation: { committed, ...rest },
  } = JSON.parse(message) as YobtaClientMessage
  return {
    headers,
    operation: {
      ...rest,
      committed: Math.min(committed, Date.now()),
    },
  }
}
