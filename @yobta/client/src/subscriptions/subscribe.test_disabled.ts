import { YOBTA_SUBSCRIBE, YOBTA_UNSUBSCRIBE } from '@yobta/protocol'

import { subscribe } from './subscribe.js'
import { getSubscription } from './getSubscription.js'
import { subscriptionsStore } from './subscriptions.js'
import { queueOperation } from '../queue/queue.js'

beforeEach(() => {
  subscriptionsStore.clear()
})

vi.mock('../queue/queue.js', () => ({ queueOperation: vi.fn() }))

it('adds the callback to the subscribers set of the given channel', () => {
  const channel = 'test-channel'
  const callback = vi.fn()

  subscribe(channel, callback)

  const subscription = getSubscription(channel, [])
  expect(subscription.subscribers).toContain(callback)
})

it('queues a subscribe operation for the given channel', () => {
  const channel = 'test-channel'
  const callback = vi.fn()

  subscribe(channel, callback)

  expect(queueOperation).toHaveBeenCalledWith({
    channel,
    id: expect.any(String),
    time: expect.any(Number),
    type: YOBTA_SUBSCRIBE,
    version: 0,
  })
})

it('returns a function that removes the callback from the subscribers set when called', () => {
  const channel = 'test-channel'
  const callback = vi.fn()
  const unsubscribe = subscribe(channel, callback)

  unsubscribe()

  const subscription = getSubscription(channel, [])
  expect(subscription.subscribers).not.toContain(callback)
})

it('queues an unsubscribe operation when the last subscriber unsubscribes', () => {
  const channel = 'test-channel'
  const callback = vi.fn()
  const unsubscribe = subscribe(channel, callback)

  unsubscribe()

  expect(queueOperation).toHaveBeenCalledWith({
    channel,
    type: YOBTA_UNSUBSCRIBE,
    id: expect.any(String),
    time: expect.any(Number),
  })
})
