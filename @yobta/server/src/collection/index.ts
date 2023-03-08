import {
  YobtaCollectionInsertOperation,
  YobtaCollectionAnySnapshot,
  YobtaCollectionUpdateOperation,
  YOBTA_COLLECTION_INSERT,
  YobtaRejectOperation,
  YOBTA_REJECT,
  YobtaDataOperation,
  YOBTA_COLLECTION_UPDATE,
  YobtaError,
  YOBTA_ERROR,
} from '@yobta/protocol'
import { nanoid } from 'nanoid'

import { getErrorMessage } from '../getErrorMessage/index.js'
import { sendBack, onClientMessage, throwBack } from '../messageBroker/index.js'
import { ServerCallbacks } from '../createServer/createServer.js'

interface CollectionFactory {
  <Item extends YobtaCollectionAnySnapshot>(props: Props<Item>): {
    destroy: VoidFunction
  }
}
type Props<Item extends YobtaCollectionAnySnapshot> = {
  channel: string
  insert(event: {
    headers: Headers
    operation: YobtaCollectionInsertOperation<Item>
  }): Promise<[YobtaCollectionInsertOperation<Item>, ...YobtaDataOperation[]]>
  update(event: {
    headers: Headers
    operation: YobtaCollectionUpdateOperation<Item>
  }): Promise<[YobtaCollectionUpdateOperation<Item>, ...YobtaDataOperation[]]>
}
type Message<Item extends YobtaCollectionAnySnapshot> = {
  headers: Headers
  operation:
    | YobtaCollectionInsertOperation<Item>
    | YobtaCollectionUpdateOperation<Item>
}

export const createCollection: CollectionFactory = <
  Item extends YobtaCollectionAnySnapshot,
>({
  channel,
  insert,
  update,
}: Props<Item>) => {
  const destroy = (): VoidFunction =>
    onClientMessage<string, [Message<Item>, ServerCallbacks]>(
      channel,
      async ({ headers, operation }, { reject }) => {
        try {
          switch (operation.type) {
            case YOBTA_COLLECTION_INSERT: {
              const operations = await insert({ headers, operation })
              sendBack(operations)
              break
            }
            case YOBTA_COLLECTION_UPDATE: {
              const operations = await update({ headers, operation })
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
          const rejectOperation: YobtaRejectOperation = {
            id: nanoid(),
            channel,
            committed: operation.committed,
            merged: Date.now(),
            reason: getErrorMessage(error),
            operationId: operation.id,
            type: YOBTA_REJECT,
          }
          reject(rejectOperation)
        }
      },
    )
  return { destroy }
}
