import { YobtaRemoteOperation } from '@yobta/protocol'
interface ServerOperationFactory {
  (operation: YobtaRemoteOperation): string
}

export const createServerOperation: ServerOperationFactory = operation => {
  return JSON.stringify(operation)
}
