import { storeYobta, YobtaStore, YOBTA_IDLE, YOBTA_READY } from '@yobta/stores'
import { nanoid } from 'nanoid'
import {
  YobtaCollectionItem,
  YobtaCollectionId,
  YobtaDataOperation,
  YobtaCollectionInsert,
  YOBTA_COLLECTION_INSERT,
  YobtaCollectionDelete,
  YOBTA_COLLECTION_DELETE,
  YobtaCollectionUpdate,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { operationResult } from '../operationResult/operationResult.js'
import { createOperationYobta } from '../createOperation/createOperation.js'
import { getSubscription } from '../subscriptions/getSubscription.js'
import { subscribe } from '../subscriptions/subscribe.js'
import { createCollectionSnapshot } from './createCollectionSnapshot.js'
import { plainObjectDiff } from '../plainObjectDiff/plainObjectDiff.js'
import { handleDataOperation } from '../subscriptions/handleDataOperation.js'

type Collection<State> = Map<YobtaCollectionId, State>
type Data<State> = Omit<State, 'id'>
type Payload<State> = Partial<Data<State>>

interface LWWCollection {
  <State extends YobtaCollectionItem>(props: {
    channel: string
    operations?: YobtaDataOperation[]
  }): {
    update: (id: YobtaCollectionId, data: Payload<State>) => Promise<void>
    delete: (id: YobtaCollectionId) => Promise<void>
    insert: (data: Data<State>, before?: YobtaCollectionId) => Promise<void>
    last(): Collection<State>
  } & Omit<YobtaStore<Collection<State>>, 'next'>
}

export const lwwCollection: LWWCollection = <
  State extends YobtaCollectionItem,
>({
  channel,
  operations = [],
}: {
  channel: string
  operations?: YobtaDataOperation[]
}) => {
  let unsubscribe: VoidFunction
  let { next, last, observe, on } = storeYobta<Collection<State>>(
    new Map(),
    ({ addMiddleware }) => {
      addMiddleware(YOBTA_READY, () => {
        let subscription = getSubscription(channel, operations)
        let snapshot = createCollectionSnapshot<State>()
        unsubscribe = subscribe(channel, logs => {
          let state = snapshot.next(logs)
          next(state)
        })
        return snapshot.next(subscription)
      })
      addMiddleware(YOBTA_IDLE, state => {
        unsubscribe()
        return state
      })
    },
  )

  return {
    async update(ref, unfiltereledData: Payload<State>) {
      let item = last().get(ref)
      // TODO: throw error if item not found
      if (!item) return
      let data = plainObjectDiff(item, unfiltereledData)
      if (!data) return
      let operation = createOperationYobta<YobtaCollectionUpdate<State>>({
        channel,
        type: YOBTA_COLLECTION_UPDATE,
        data,
        ref,
      })
      handleDataOperation(operation)
      return operationResult(operation.id)
    },
    async delete(ref) {
      // NOTE: delete should not throw error if item not found
      let operation = createOperationYobta<YobtaCollectionDelete>({
        channel,
        type: YOBTA_COLLECTION_DELETE,
        ref,
      })
      handleDataOperation(operation)
      return operationResult(operation.id)
    },
    insert(item: Data<State>, ref) {
      let data = {
        id: nanoid(),
        ...item,
      } as State

      // TODO: throw error if ref not found
      let operation = createOperationYobta<YobtaCollectionInsert<State>>({
        channel,
        type: YOBTA_COLLECTION_INSERT,
        data,
        ref,
      })
      handleDataOperation(operation)
      return operationResult(operation.id)
    },
    last,
    observe,
    on,
  }
}
