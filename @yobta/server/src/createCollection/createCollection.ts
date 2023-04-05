import {
  YOBTA_BATCH,
  YobtaBatchOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionOperation,
  YobtaHeaders,
  YobtaSubscribeOperation,
} from '@yobta/protocol'
import { nanoid } from 'nanoid'

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
  revalidate(
    operation: YobtaSubscribeOperation,
  ): Promise<YobtaBatchOperation<Snapshot>>
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
    revalidate: async ({ channel, merged }) => {
      const data = await log.find(channel, merged)
      const operation: YobtaBatchOperation<Snapshot> = {
        id: nanoid(),
        channel,
        type: YOBTA_BATCH,
        data,
      }
      return operation
    },
    merge: ({ operation }: YobtaCollectionMessage<Snapshot>) =>
      log.merge(name, operation),
  }
}
