// import { YobtaCollectionDelete, YOBTA_COLLECTION_DELETE } from '@yobta/protocol'

import { getSubscription } from './getSubscription.js'
import { subscriptionsStore } from './subscriptions.js'

afterEach(() => {
  subscriptionsStore.clear()
})

it('should return a Subscription object for the given channel', () => {
  const channel = 'myChannel'
  const subscription = getSubscription(channel, [])

  expect(subscription).toEqual({
    subscribers: expect.any(Set),
    committed: expect.any(Object),
    pending: expect.any(Object),
  })
})

it('should create a new Subscription object if it does not exist in the store', () => {
  const channel = 'myChannel'
  const subscription1 = getSubscription(channel, [])
  const subscription2 = getSubscription(channel, [])

  expect(subscription1).toBe(subscription2)
})

// it('sould pass operations to the committed log', () => {
//   const channel = 'myChannel'
//   const operations: YobtaCollectionDelete[] = [
//     {
//       id: '1',
//       channel: 'test',
//       time: 2,
//       type: YOBTA_COLLECTION_DELETE,
//       ref: '2',
//     },
//   ]
//   const subscription = getSubscription(channel, operations)

//   expect([...subscription.committed.values()]).toEqual(operations)
// })
