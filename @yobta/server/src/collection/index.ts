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
} from '@yobta/protocol'
import { nanoid } from 'nanoid'

import { getErrorMessage } from '../getErrorMessage/index.js'
import { sendBack, onClientMessage, throwBack } from '../messageBroker/index.js'
import { ServerCallbacks } from '../server/index.js'

interface CollectionFactory {
  <Item extends YobtaCollectionItem>(props: Props<Item>): {
    destroy: VoidFunction
  }
}
type Props<Item extends YobtaCollectionItem> = {
  channel: string
  insert(event: {
    headers: Headers
    operation: YobtaCollectionInsert<Item>
  }): Promise<[YobtaCollectionInsert<Item>, ...YobtaDataOperation[]]>
  update(event: {
    headers: Headers
    operation: YobtaCollectionUpdate<Item>
  }): Promise<[YobtaCollectionUpdate<Item>, ...YobtaDataOperation[]]>
  delete(event: {
    headers: Headers
    operation: YobtaCollectionDelete
  }): Promise<[YobtaCollectionDelete, ...YobtaDataOperation[]]>
}
type Message<Item extends YobtaCollectionItem> = {
  headers: Headers
  operation:
    | YobtaCollectionInsert<Item>
    | YobtaCollectionUpdate<Item>
    | YobtaCollectionDelete
}

export const collectionYobta: CollectionFactory = <
  Item extends YobtaCollectionItem,
>({
  channel,
  insert,
  update,
  delete: remove,
}: Props<Item>) => {
  const destroy = () =>
    onClientMessage<string, [Message<Item>, ServerCallbacks]>(
      channel,
      async ({ headers, operation }, { commit, reject }) => {
        try {
          switch (operation.type) {
            case YOBTA_COLLECTION_INSERT: {
              const operations = await insert({ headers, operation })
              const commitOperation: YobtaCommit = {
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
              const operations = await update({ headers, operation })
              const updateOperation: YobtaCommit = {
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
              const operations = await remove({ headers, operation })
              const updateOperation: YobtaCommit = {
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
              const error: YobtaError = {
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
          const rejectOperation: YobtaReject = {
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
  return { destroy }
}
