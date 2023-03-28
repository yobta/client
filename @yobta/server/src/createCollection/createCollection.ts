import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionOperation,
  YobtaHeaders,
  YobtaSubscribeOperation,
} from '@yobta/protocol'

import {
  YobtaServerLog,
  YobtaServerLogSearchResult,
} from '../createMemoryLog/createMemoryLog.js'
import { notifySibscribers } from '../subscriptonManager/subscriptonManager.js'

interface YobtaCollectionFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaCollectionProps<Snapshot>,
  ): YobtaCollection<Snapshot>
}
type YobtaCollectionProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  name: string
  log: YobtaServerLog<YobtaCollectionAnySnapshot>
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
  headers: YobtaHeaders
  operation: YobtaCollectionOperation<Snapshot>
}
export type YobtaCollection<Snapshot extends YobtaCollectionAnySnapshot> = {
  name: string
  // getSnapshot(channel: string, id: YobtaCollectionId): Promise<Snapshot>
  revalidate(
    operation: YobtaSubscribeOperation,
  ): Promise<YobtaServerLogSearchResult[]>
  merge(operation: YobtaCollectionMessage<Snapshot>): Promise<void>
}

export const createCollection: YobtaCollectionFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  name,
  log,
}: YobtaCollectionProps<Snapshot>) => {
  return {
    get name() {
      return name
    },
    revalidate(operation) {
      return log.find(operation.channel, operation.merged)
    },
    async merge({ operation }: YobtaCollectionMessage<Snapshot>) {
      const loggedOperation = await log.merge(name, operation)
      notifySibscribers([loggedOperation])
    },
  }
}
