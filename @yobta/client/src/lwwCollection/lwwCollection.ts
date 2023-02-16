import { createStore, YobtaStore, YOBTA_IDLE, YOBTA_READY } from '@yobta/stores'
import { nanoid } from 'nanoid'
import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionId,
  YobtaDataOperation,
  YobtaCollectionInsertOperation,
  YOBTA_COLLECTION_INSERT,
  YobtaCollectionUpdateOperation,
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
  <State extends YobtaCollectionAnySnapshot>(props: {
    channel: string
    operations?: YobtaDataOperation[]
  }): {
    update: (id: YobtaCollectionId, data: Payload<State>) => Promise<void>
    insert: (data: Data<State>, before?: YobtaCollectionId) => Promise<void>
    last(): Collection<State>
  } & Omit<YobtaStore<Collection<State>>, 'next'>
}

export const lwwCollection: LWWCollection = <
  State extends YobtaCollectionAnySnapshot,
>({
  channel,
  operations = [],
}: {
  channel: string
  operations?: YobtaDataOperation[]
}) => {
  let unsubscribe: VoidFunction
  const { next, last, observe, on } = createStore<Collection<State>>(
    new Map(),
    ({ addMiddleware }) => {
      addMiddleware(YOBTA_READY, () => {
        const subscription = getSubscription(channel, operations)
        const snapshot = createCollectionSnapshot<State>()
        unsubscribe = subscribe(channel, logs => {
          const state = snapshot.next(logs)
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
      const item = last().get(ref)
      // TODO: throw error if item not found
      if (!item) return
      const data = plainObjectDiff(item, unfiltereledData)
      if (!data) return
      const operation = createOperationYobta<
        YobtaCollectionUpdateOperation<State>
      >({
        channel,
        type: YOBTA_COLLECTION_UPDATE,
        data,
        ref,
      })
      handleDataOperation(operation)
      return operationResult(operation.id)
    },
    insert(item: Data<State>, before) {
      const data = {
        id: nanoid(),
        ...item,
      } as State

      // TODO: throw error if ref not found
      const operation = createOperationYobta<
        YobtaCollectionInsertOperation<State>
      >({
        channel,
        type: YOBTA_COLLECTION_INSERT,
        data,
        ref: data.id,
        before,
      })
      handleDataOperation(operation)
      return operationResult(operation.id)
    },
    last,
    observe,
    on,
  }
}
