import { YobtaClientMessage } from '@yobta/protocol'

interface ParseClientOperation {
  (message: string): YobtaClientMessage
}

export const parseClientOperation: ParseClientOperation = message => {
  const { headers, operation } = JSON.parse(message)
  return {
    headers,
    operation: {
      ...operation,
      time: Math.min(operation.time, Date.now()),
    },
  }
}
