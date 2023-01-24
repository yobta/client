import { YobtaClientOperation } from '@yobta/protocol'

interface ClientOperationFactory {
  (message: string): {
    headers: Headers
    operation: YobtaClientOperation
  }
}

export const parseClientOperation: ClientOperationFactory = message => {
  let { headers, operation } = JSON.parse(message)
  return {
    headers,
    operation: {
      ...operation,
      time: Math.min(operation.time, Date.now()),
    },
  }
}
