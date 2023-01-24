import {
  YobtaCollectionInsert,
  YobtaCollectionItem,
  YobtaCollectionUpdate,
  YobtaCollectionDelete,
} from '@yobta/protocol'

import { log } from '../logger'
import { messageBroker } from '../messageBroker'

interface CollectionFactory {
  <Item extends YobtaCollectionItem>(props: {
    channel: string
    onInsert(
      callback: (event: {
        headers: Headers
        operation: YobtaCollectionInsert<Item>
      }) => Promise<YobtaCollectionInsert<Item>>,
    ): void
    onUpdate(
      callback: (event: {
        headers: Headers
        operation: YobtaCollectionUpdate<Item>
      }) => Promise<YobtaCollectionUpdate<Item>>,
    ): void
    onDelete(
      callback: (event: {
        headers: Headers
        operation: YobtaCollectionDelete
      }) => Promise<YobtaCollectionDelete>,
    ): void
  }): VoidFunction
}

export const collectionYobta: CollectionFactory = ({ channel }) => {
  let destroy = () =>
    messageBroker.subscribe(channel, message => {
      log(message)
    })
  return destroy
}
