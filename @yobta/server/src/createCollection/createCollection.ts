import {
  YobtaCollectionInsert,
  YobtaCollectionItem,
  YobtaCollectionUpdate,
  YobtaCollectionDelete,
  YOBTA_COLLECTION_INSERT,
  YobtaReject,
  YobtaCommit,
  YOBTA_COMMIT,
  YOBTA_REJECT,
  YobtaDataOperation,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_COLLECTION_DELETE,
  YobtaError,
  YOBTA_ERROR,
  YOBTA_SUBSCRIBE,
  YobtaSubscribe,
  YOBTA_UNSUBSCRIBE,
  YobtaUnsubscribe,
} from '@yobta/protocol'
import { nanoid } from 'nanoid'

import { getErrorMessage } from '../getErrorMessage/index.js'
import { sendBack, onClientMessage, throwBack } from '../messageBroker/index.js'
import { ServerCallbacks } from '../createServer/createServer.js'

interface CollectionFactory {
  <Item extends YobtaCollectionItem>(props: Props<Item>): {
    name: string
  }
}
type Props<Item extends YobtaCollectionItem> = {
  name: string
  onInsert(event: {
    headers: Headers
    operation: YobtaCollectionInsert<Item>
  }): Promise<[YobtaCollectionInsert<Item>, ...YobtaDataOperation[]]>
  onUpdate(event: {
    headers: Headers
    operation: YobtaCollectionUpdate<Item>
  }): Promise<[YobtaCollectionUpdate<Item>, ...YobtaDataOperation[]]>
  onDelete(event: {
    headers: Headers
    operation: YobtaCollectionDelete
  }): Promise<[YobtaCollectionDelete, ...YobtaDataOperation[]]>
  onSubscribe(event: {
    headers: Headers
    operation: YobtaSubscribe
  }): Promise<void>
}
type Message<Item extends YobtaCollectionItem> = {
  headers: Headers
  operation:
    | YobtaCollectionInsert<Item>
    | YobtaCollectionUpdate<Item>
    | YobtaCollectionDelete
    | YobtaSubscribe
    | YobtaUnsubscribe
}

export const createCollection: CollectionFactory = <
  Item extends YobtaCollectionItem,
>({
  name: channel,
  onInsert,
  onUpdate,
  onDelete,
  onSubscribe,
}: Props<Item>) => {
  console.log('mount: ', channel)
  onClientMessage<string, [Message<Item>, ServerCallbacks]>(
    channel,
    async (
      { headers, operation },
      { commit, reject, subscribe, unsubscribe },
    ) => {
      try {
        switch (operation.type) {
          case YOBTA_SUBSCRIBE: {
            await onSubscribe({ headers, operation })
            subscribe(operation)
            break
          }
          case YOBTA_UNSUBSCRIBE: {
            unsubscribe(operation)
            break
          }
          case YOBTA_COLLECTION_INSERT: {
            let operations = await onInsert({ headers, operation })
            let commitOperation: YobtaCommit = {
              id: nanoid(),
              channel,
              time: Date.now(),
              ref: operation.id,
              type: YOBTA_COMMIT,
            }
            commit(commitOperation)
            sendBack(operations)
            break
          }
          case YOBTA_COLLECTION_UPDATE: {
            let operations = await onUpdate({ headers, operation })
            let updateOperation: YobtaCommit = {
              id: nanoid(),
              channel,
              time: Date.now(),
              ref: operation.id,
              type: YOBTA_COMMIT,
            }
            commit(updateOperation)
            sendBack(operations)
            break
          }
          case YOBTA_COLLECTION_DELETE: {
            let operations = await onDelete({ headers, operation })
            let updateOperation: YobtaCommit = {
              id: nanoid(),
              channel,
              time: Date.now(),
              ref: operation.id,
              type: YOBTA_COMMIT,
            }
            commit(updateOperation)
            sendBack(operations)
            break
          }
          default: {
            let error: YobtaError = {
              id: nanoid(),
              message: 'Unknown operation type',
              type: YOBTA_ERROR,
              time: Date.now(),
            }
            throwBack(error)
            break
          }
        }
      } catch (error) {
        let rejectOperation: YobtaReject = {
          id: nanoid(),
          channel,
          time: Date.now(),
          reason: getErrorMessage(error),
          ref: operation.id,
          type: YOBTA_REJECT,
        }
        reject(rejectOperation)
      }
    },
  )
  return {
    get name() {
      return channel
    },
  }
}
