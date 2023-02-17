import {
  YobtaCollectionInsertOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YobtaReject,
  YobtaCommit,
  YOBTA_COMMIT,
  YOBTA_REJECT,
  YobtaDataOperation,
  YOBTA_COLLECTION_UPDATE,
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
  <Item extends YobtaCollectionAnySnapshot>(props: Props<Item>): {
    name: string
  }
}
type Props<Item extends YobtaCollectionAnySnapshot> = {
  name: string
  onInsert(event: {
    headers: Headers
    operation: YobtaCollectionInsertOperation<Item>
  }): Promise<[YobtaCollectionInsertOperation<Item>, ...YobtaDataOperation[]]>
  onUpdate(event: {
    headers: Headers
    operation: YobtaCollectionUpdateOperation<Item>
  }): Promise<[YobtaCollectionUpdateOperation<Item>, ...YobtaDataOperation[]]>
  onSubscribe(event: {
    headers: Headers
    operation: YobtaSubscribe
  }): Promise<void>
}
type Message<Item extends YobtaCollectionAnySnapshot> = {
  headers: Headers
  operation:
    | YobtaCollectionInsertOperation<Item>
    | YobtaCollectionUpdateOperation<Item>
    | YobtaSubscribe
    | YobtaUnsubscribe
}

export const createCollection: CollectionFactory = <
  Item extends YobtaCollectionAnySnapshot,
>({
  name: channel,
  onInsert,
  onUpdate,
  onSubscribe,
}: Props<Item>) => {
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
            const operations = await onInsert({ headers, operation })
            const commitOperation: YobtaCommit = {
              id: nanoid(),
              channel,
              committed: Date.now(),
              ref: operation.id,
              type: YOBTA_COMMIT,
            }
            commit(commitOperation)
            sendBack(operations)
            break
          }
          case YOBTA_COLLECTION_UPDATE: {
            const operations = await onUpdate({ headers, operation })
            const updateOperation: YobtaCommit = {
              id: nanoid(),
              channel,
              committed: Date.now(),
              ref: operation.id,
              type: YOBTA_COMMIT,
            }
            commit(updateOperation)
            sendBack(operations)
            break
          }
          default: {
            const error: YobtaError = {
              id: nanoid(),
              message: 'Unknown operation type',
              type: YOBTA_ERROR,
              committed: Date.now(),
            }
            throwBack(error)
            break
          }
        }
      } catch (error) {
        const rejectOperation: YobtaReject = {
          id: nanoid(),
          channel,
          committed: Date.now(),
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
