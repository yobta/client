import {
  YobtaCollectionAnySnapshot,
  YobtaServerOperation,
} from '@yobta/protocol'

interface YobtaStringifyServerOperation {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operation: YobtaServerOperation<Snapshot>,
  ): string
}

export const stringifyServerOperation: YobtaStringifyServerOperation =
  operation => JSON.stringify(operation)
