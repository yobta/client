import { YobtaRemoteOperation } from '@yobta/protocol'

interface YobtaStringifyServerOperation {
  (operation: YobtaRemoteOperation): string
}

export const stringifyServerOperation: YobtaStringifyServerOperation =
  operation => JSON.stringify(operation)
