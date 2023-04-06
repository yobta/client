import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionOperation,
  YobtaHeaders,
} from '@yobta/protocol'

import { YobtaServerLog } from '../createMemoryLog/createMemoryLog.js'

interface YobtaCollectionFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaCollectionProps<Snapshot>,
  ): YobtaCollection<Snapshot>
}
type YobtaCollectionProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  name: string
  log: YobtaServerLog<Snapshot>
}
export type YobtaCollectionMessage<
  Snapshot extends YobtaCollectionAnySnapshot,
> = {
  headers: YobtaHeaders
  operation: YobtaCollectionOperation<Snapshot>
}
export type YobtaCollection<Snapshot extends YobtaCollectionAnySnapshot> = {
  name: string
  revalidate: YobtaServerLog<Snapshot>['find']
  merge(
    message: YobtaCollectionMessage<Snapshot>,
  ): Promise<YobtaCollectionOperation<Snapshot>>
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
    revalidate: log.find,
    merge: ({ operation }: YobtaCollectionMessage<Snapshot>) =>
      log.merge(name, operation),
  }
}
