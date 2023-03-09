import {
  YobtaCollectionAnySnapshot,
  YobtaRemoteOperation,
} from '@yobta/protocol'

interface YobtaStringifyServerOperation {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operation: YobtaRemoteOperation<Snapshot>,
  ): string
}

export const stringifyServerOperation: YobtaStringifyServerOperation =
  operation => JSON.stringify(operation)
