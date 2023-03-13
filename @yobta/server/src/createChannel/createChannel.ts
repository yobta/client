import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionOperation,
  YobtaSubscribeOperation,
  YobtaUnsubscribeOperation,
  YOBTA_SUBSCRIBE,
  YOBTA_UNSUBSCRIBE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YobtaHeaders,
} from '@yobta/protocol'

import { YobtaCollection } from '../createCollection/createCollection.js'
import { ServerCallbacks } from '../createServer/createServer.js'
import { onClientMessage } from '../messageBroker/messageBroker.js'

interface YobtaChannelFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    props: YobtaChannelProps<Snapshot>,
  ): VoidFunction
}

type YobtaChannelProps<Snapshot extends YobtaCollectionAnySnapshot> = {
  collection: YobtaCollection<Snapshot>
  route: string
  access: {
    read(message: {
      headers: YobtaHeaders
      operation: YobtaSubscribeOperation
    }): Promise<void>
    write(message: {
      headers: YobtaHeaders
      operation: YobtaCollectionOperation<Snapshot>
    }): Promise<void>
  }
}

type Message<Snapshot extends YobtaCollectionAnySnapshot> = {
  headers: YobtaHeaders
  operation:
    | YobtaCollectionOperation<Snapshot>
    | YobtaSubscribeOperation
    | YobtaUnsubscribeOperation
}

export const createChannel: YobtaChannelFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>({
  access,
  collection,
  route,
}: YobtaChannelProps<Snapshot>) =>
  onClientMessage<string, [Message<Snapshot>, ServerCallbacks]>(
    route,
    async ({ headers, operation }, { subscribe, unsubscribe }) => {
      switch (operation.type) {
        case YOBTA_SUBSCRIBE: {
          await access.read({ headers, operation })
          subscribe(operation)
          await collection.revalidate(operation)
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
