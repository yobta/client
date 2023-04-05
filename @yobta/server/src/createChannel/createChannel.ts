import {
  YobtaCollectionAnySnapshot,
  YobtaSubscribeOperation,
  YobtaUnsubscribeOperation,
  YobtaCollectionOperation,
  YOBTA_SUBSCRIBE,
  YOBTA_UNSUBSCRIBE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_COLLECTION_MOVE,
  YobtaHeaders,
} from '@yobta/protocol'
import { YobtaRouteParams } from '@yobta/utils'

import { YobtaCollection } from '../createCollection/createCollection.js'
import { ServerCallbacks } from '../createServer/createServer.js'
import { onClientMessage } from '../router/router.js'
import { serverLogger } from '../serverLogger/serverLogger.js'
import { notifySibscribers } from '../subscriptonManager/subscriptonManager.js'

interface YobtaChannelFactory {
  <Snapshot extends YobtaCollectionAnySnapshot, Route extends string>(
    props: YobtaChannelProps<Snapshot, Route>,
  ): VoidFunction
}

type YobtaChannelProps<
  Snapshot extends YobtaCollectionAnySnapshot,
  Route extends string,
> = {
  collection: YobtaCollection<Snapshot>
  route: Route
  access: {
    read(message: {
      params: YobtaRouteParams<Route>
      headers: YobtaHeaders
      operation: YobtaSubscribeOperation
    }): Promise<void>
    write(message: {
      params: YobtaRouteParams<Route>
      headers: YobtaHeaders
      operation: YobtaCollectionOperation<Snapshot>
    }): Promise<void>
  }
}

type Message<Snapshot extends YobtaCollectionAnySnapshot> = {
  clientId: string
  headers: YobtaHeaders
  operation:
    | YobtaCollectionOperation<Snapshot>
    | YobtaSubscribeOperation
    | YobtaUnsubscribeOperation
}

export const createChannel: YobtaChannelFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
  Route extends string,
>({
  access,
  collection,
  route,
}: YobtaChannelProps<Snapshot, Route>) =>
  onClientMessage<Route, [Message<Snapshot>, ServerCallbacks]>(
    route,
    async (
      params,
      { clientId, headers, operation },
      { sendBack, subscribe, unsubscribe },
    ) => {
      switch (operation.type) {
        case YOBTA_SUBSCRIBE: {
          await access.read({ params, headers, operation })
          subscribe(clientId, operation)
          const batch = await collection.revalidate(operation)
          sendBack([batch])
          break
        }
        case YOBTA_UNSUBSCRIBE: {
          unsubscribe(clientId, operation)
          break
        }
        case YOBTA_COLLECTION_INSERT:
        case YOBTA_COLLECTION_UPDATE:
        case YOBTA_COLLECTION_DELETE:
        case YOBTA_COLLECTION_RESTORE:
        case YOBTA_COLLECTION_MOVE: {
          await access.write({ params, headers, operation })
          const merged = await collection.merge({ headers, operation })
          sendBack([merged])
          notifySibscribers([merged])
          break
        }
        default:
          serverLogger.error({ headers, operation }, 'Unknown operation type')
          break
      }
    },
  )
