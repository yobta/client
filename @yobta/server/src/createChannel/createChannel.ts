import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionOperation,
  YobtaSubscribe,
  YobtaUnsubscribe,
  YOBTA_SUBSCRIBE,
  YOBTA_UNSUBSCRIBE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaCollection } from '../createCollection/createCollection.js'
import { ServerCallbacks } from '../createServer/createServer.js'
import { onClientMessage } from '../messageBroker/index.js'

interface YobtaChannelFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaChannelProps<Snapshot>,
  ): VoidFunction
}

type YobtaChannelProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  collection: YobtaCollection<Snapshot>
  name: string
  access: {
    read(message: {
      headers: Headers
      operation: YobtaSubscribe
    }): Promise<void>
    write(message: {
      headers: Headers
      operation: YobtaCollectionOperation<Snapshot>
    }): Promise<void>
  }
}

type Message<Snapshot extends YobtaCollectionAnySnapshot> = {
  headers: Headers
  operation:
    | YobtaCollectionOperation<Snapshot>
    | YobtaSubscribe
    | YobtaUnsubscribe
}

export const createChannel: YobtaChannelFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  access,
  collection,
  name,
}: YobtaChannelProps<Snapshot>) =>
  onClientMessage<string, [Message<Snapshot>, ServerCallbacks]>(
    name,
    async ({ headers, operation }, { subscribe, unsubscribe }) => {
      switch (operation.type) {
        case YOBTA_SUBSCRIBE: {
          await access.read({ headers, operation })
          subscribe(operation)
          collection.revalidate(operation)
          break
        }
        case YOBTA_UNSUBSCRIBE: {
          unsubscribe(operation)
          break
        }
        case YOBTA_COLLECTION_INSERT:
        case YOBTA_COLLECTION_UPDATE: {
          await access.write({ headers, operation })
          await collection.merge({ headers, operation })
          break
        }
        default:
          break
      }
    },
  )
