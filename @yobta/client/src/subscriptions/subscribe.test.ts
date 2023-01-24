import { subscribe } from './subscribe.js'
import { getSubscription } from './getSubscription.js'
import { subscriptionsStore } from './subscriptions.js'
import { YOBTA_SUBSCRIBE, YOBTA_UNSUBSCRIBE } from '../protocol/protocol.js'
import { queueOperation } from '../queue/queue.js'

beforeEach(() => {
  subscriptionsStore.clear()
})

vi.mock('../queue/queue.js', () => ({ queueOperation: vi.fn() }))

it('adds the callback to the subscribers set of the given channel', () => {
  let channel = 'test-channel'
  let callback = vi.fn()

  subscribe(channel, callback)

  let subscription = getSubscription(channel, [])
  expect(subscription.subscribers).toContain(callback)
})

it('queues a subscribe operation for the given channel', () => {
  let channel = 'test-channel'
  let callback = vi.fn()

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
  let channel = 'test-channel'
  let callback = vi.fn()
  let unsubscribe = subscribe(channel, callback)

  unsubscribe()

  let subscription = getSubscription(channel, [])
  expect(subscription.subscribers).not.toContain(callback)
})

it('queues an unsubscribe operation when the last subscriber unsubscribes', () => {
  let channel = 'test-channel'
  let callback = vi.fn()
  let unsubscribe = subscribe(channel, callback)

  unsubscribe()

  expect(queueOperation).toHaveBeenCalledWith({
    channel,
    type: YOBTA_UNSUBSCRIBE,
    id: expect.any(String),
    time: expect.any(Number),
  })
})
