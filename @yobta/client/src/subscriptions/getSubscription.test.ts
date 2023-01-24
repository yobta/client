import {
  YobtaCollectionDelete,
  YOBTA_COLLECTION_DELETE,
} from '../protocol/protocol.js'
import { getSubscription } from './getSubscription.js'
import { subscriptionsStore } from './subscriptions.js'

afterEach(() => {
  subscriptionsStore.clear()
})

it('should return a Subscription object for the given channel', () => {
  let channel = 'myChannel'
  let subscription = getSubscription(channel, [])

  expect(subscription).toEqual({
    subscribers: expect.any(Set),
    committed: expect.any(Object),
    pending: expect.any(Object),
  })
})

it('should create a new Subscription object if it does not exist in the store', () => {
  let channel = 'myChannel'
  let subscription1 = getSubscription(channel, [])
  let subscription2 = getSubscription(channel, [])

  expect(subscription1).toBe(subscription2)
})

it('sould pass operations to the committed log', () => {
  let channel = 'myChannel'
  let operations: YobtaCollectionDelete[] = [
    {
      id: '1',
      channel: 'test',
      time: 2,
      type: YOBTA_COLLECTION_DELETE,
      ref: '2',
    },
  ]
  let subscription = getSubscription(channel, operations)

  expect([...subscription.committed.values()]).toEqual(operations)
})
