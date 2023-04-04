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

interface YobtaCollectionFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaCollectionProps,
  ): YobtaCollection<Snapshot>
}
type YobtaCollectionProps = {
  name: string
  log: YobtaServerLog<YobtaCollectionAnySnapshot>
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
  merge(
    operation: YobtaCollectionMessage<Snapshot>,
  ): Promise<YobtaCollectionOperation<Snapshot>>
}

export const createCollection: YobtaCollectionFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  name,
  log,
}: YobtaCollectionProps) => {
  return {
    get name() {
      return name
    },
    revalidate: operation => log.find(operation.channel, operation.merged),
    merge: ({ operation }: YobtaCollectionMessage<Snapshot>) =>
      log.merge(name, operation),
  }
}
