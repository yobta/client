import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaCollectionOperation,
  YobtaSubscribe,
} from '@yobta/protocol'

interface YobtaCollectionFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaCollectionProps<Snapshot>,
  ): YobtaCollection<Snapshot>
}
type YobtaCollectionProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  name: string
  read(channel: string, id: YobtaCollectionId): Promise<Snapshot>
  write(
    event: Message<Snapshot>,
  ): Promise<
    [
      YobtaCollectionOperation<Snapshot>,
      ...YobtaCollectionOperation<Snapshot>[],
    ]
  >
}
type Message<Snapshot extends YobtaCollectionAnySnapshot> = {
  headers: Headers
  operation: YobtaCollectionOperation<Snapshot>
}
export type YobtaCollection<Snapshot extends YobtaCollectionAnySnapshot> = {
  name: string
  getSnapshot(channel: string, id: YobtaCollectionId): Promise<Snapshot>
  revalidate(operation: YobtaSubscribe): Promise<void>
  merge(operation: Message<Snapshot>): Promise<void>
}

export const createCollection: YobtaCollectionFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  name,
  read,
  write,
}: YobtaCollectionProps<Snapshot>) => {
  return {
    get name() {
      return name
    },
    getSnapshot(channel, id) {
      return read(channel, id)
    },
    async revalidate(operation) {},
    async merge(message: Message<Snapshot>) {
      const operations = await write(message)
    },
  }
}
