import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionOperation,
  YobtaSubscribeOperation,
} from '@yobta/protocol'

import { YobtaLog } from '../createMemoryLog/createMemoryLog.js'
import { createOperationsFromEntries } from '../createOperationsFromEntries/createOperationsFromEntries.js'
import { sendBack } from '../messageBroker/index.js'
import { validateCommitTime } from '../validateCommitTime/validateCommitTime.js'

interface YobtaCollectionFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaCollectionProps<Snapshot>,
  ): YobtaCollection<Snapshot>
}
type YobtaCollectionProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  name: string
  log: YobtaLog
  // read(channel: string, id: YobtaCollectionId): Promise<Snapshot>
  write(
    message: YobtaCollectionMessage<Snapshot>,
  ): Promise<
    [
      YobtaCollectionOperation<Snapshot>,
      ...YobtaCollectionOperation<Snapshot>[],
    ]
  >
}
export type YobtaCollectionMessage<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  headers: Headers
  operation: YobtaCollectionOperation<Snapshot>
}
export type YobtaCollection<Snapshot extends YobtaCollectionAnySnapshot> = {
  name: string
  // getSnapshot(channel: string, id: YobtaCollectionId): Promise<Snapshot>
  revalidate(operation: YobtaSubscribeOperation): Promise<void>
  merge(operation: YobtaCollectionMessage<Snapshot>): Promise<void>
}

export const createCollection: YobtaCollectionFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  name,
  log,
  write,
}: YobtaCollectionProps<Snapshot>) => {
  return {
    get name() {
      return name
    },
    async revalidate(operation) {
      const entries = await log.find(operation.channel, operation.merged)
      if (entries.length) {
        const operations = createOperationsFromEntries(entries)
        sendBack(operations)
      }
    },
    async merge({ headers, operation }: YobtaCollectionMessage<Snapshot>) {
      const fixedOperation = {
        ...operation,
        committed: validateCommitTime(operation.committed),
      }
      const operations = await write({ headers, operation: fixedOperation })
      const entries = await log.merge(name, operations)
      const loggedOperations = entries.map(createOperationsFromEntries).flat()
      sendBack(loggedOperations)
    },
  }
}
