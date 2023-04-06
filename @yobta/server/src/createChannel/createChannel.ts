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
  YobtaBatchOperation,
  YOBTA_BATCH,
} from '@yobta/protocol'
import { YobtaRouteParams, coerceError } from '@yobta/utils'
import { nanoid } from 'nanoid'

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
  chunkSize: number
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
  chunkSize,
  route,
}: YobtaChannelProps<Snapshot, Route>) =>
  onClientMessage<Route, [Message<Snapshot>, ServerCallbacks]>(
    route,
    async (
      params,
      { clientId, headers, operation },
      { reject, sendBack, subscribe, unsubscribe },
    ) => {
      switch (operation.type) {
        case YOBTA_SUBSCRIBE: {
          await access.read({ params, headers, operation })
          subscribe(clientId, operation)
          const stream = collection.revalidate(
            operation.channel,
            operation.merged,
            chunkSize,
          )
          let sentCount = 0
          let chunkCount = 0
          try {
            for await (const data of stream) {
              sentCount += data.length
              chunkCount += 1
              serverLogger.debug(`Sending chunk ${chunkCount}`)
              const batch: YobtaBatchOperation<Snapshot> = {
                id: nanoid(),
                channel: route,
                type: YOBTA_BATCH,
                data,
              }
              sendBack([batch])
            }
          } catch (err) {
            const error = coerceError(err)
            reject(operation, error.message)
            serverLogger.error(err)
          }
          serverLogger.debug(`Operations sent: ${sentCount}`, operation)
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
