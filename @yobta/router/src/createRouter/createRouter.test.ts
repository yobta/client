import { vi } from 'vitest'

import { createRouter } from './createRouter.js'

describe('factory', () => {
  it('creates router instance', () => {
    const router = createRouter()
    expect(router).toMatchObject({
      subscribe: expect.any(Function),
      publish: expect.any(Function),
    })
  })
})

describe('pub/sub', () => {
  it('allows static routes', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/user/123', mockSubscriber)
    router.publish('/user/123')
    expect(mockSubscriber).toBeCalledTimes(1)
    expect(mockSubscriber).toBeCalledWith({})
  })
  it('supports required params', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/user/:id/:name', mockSubscriber)
    router.publish('/user/123/me')
    expect(mockSubscriber).toBeCalledTimes(1)
    expect(mockSubscriber).toBeCalledWith({ id: '123', name: 'me' })
  })
  it('suports optional params', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/user/:id/:name?', mockSubscriber)
    router.publish('/user/123')
    expect(mockSubscriber).toBeCalledTimes(1)
    expect(mockSubscriber).toBeCalledWith({ id: '123' })
  })
  it('unsubscribes', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    const unsubscribe = router.subscribe('/user/123', mockSubscriber)
    unsubscribe()
    router.publish('/user/123', 'data')
    expect(mockSubscriber).not.toBeCalled()
  })
  it('respects params case', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/usEr/:id', mockSubscriber)
    router.publish('/user/Userid')
    expect(mockSubscriber).toBeCalledWith({ id: 'Userid' })
    router.publish('/user/userId')
    expect(mockSubscriber).toBeCalledWith({ id: 'userId' })
  })
  it('ignores trailing slash in publish path', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/user/:id', mockSubscriber)
    router.publish('/user/Userid/')
    expect(mockSubscriber).toBeCalledTimes(1)
    expect(mockSubscriber).toBeCalledWith({ id: 'Userid' })
  })
  it('allows multiple subscriptions', () => {
    const router = createRouter()
    const mockSubscriber1 = vi.fn()
    const mockSubscriber2 = vi.fn()
    router.subscribe('/user/:id', mockSubscriber1)
    router.subscribe('/user/:id', mockSubscriber2)
    router.publish('/user/Userid')
    expect(mockSubscriber2).toBeCalledWith({ id: 'Userid' })
    expect(mockSubscriber1).toBeCalledWith({ id: 'Userid' })
  })
  it('notifies only first matched route', () => {
    const router = createRouter()
    const mockSubscriber1 = vi.fn()
    const mockSubscriber2 = vi.fn()
    router.subscribe('/user/:userid', mockSubscriber1)
    router.subscribe('/user/:id/:name?', mockSubscriber2)
    router.publish('/user/Userid')
    expect(mockSubscriber1).toBeCalledTimes(1)
    expect(mockSubscriber1).toBeCalledWith({ userid: 'Userid' })
    expect(mockSubscriber2).toBeCalledTimes(0)
  })
  it('prevents collisions', () => {
    const router = createRouter()
    const mockSubscriber1 = vi.fn()
    const mockSubscriber2 = vi.fn()
    router.subscribe('/user/:id', mockSubscriber1)
    expect(() => router.subscribe('/user/:id?', mockSubscriber2)).toThrow()
    expect(() => router.subscribe('/user/:name', mockSubscriber2)).toThrow()
  })
  it('ignores unknown urls and returns false when published', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/user/:id', mockSubscriber)
    const result = router.publish('/user/123/name')
    expect(mockSubscriber).not.toBeCalled()
    expect(result).toBe(false)
  })
  it('subscribes to empty route', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('', mockSubscriber)
    router.publish('/', 'data')
    router.publish('', 'data')
    expect(mockSubscriber).toBeCalledTimes(2)
  })
  it('ignores incorrect params', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/user/?:id', mockSubscriber)
    router.publish('/user/?123')
    expect(mockSubscriber).toBeCalledTimes(0)
  })
  it('deduplicates subscribers', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    const unsubscrbe1 = router.subscribe('/user/:id', mockSubscriber)
    router.subscribe('/user/:id', mockSubscriber)
    router.publish('/user/123')
    expect(mockSubscriber).toBeCalledTimes(1)
    expect(mockSubscriber).toBeCalledWith({ id: '123' })
    unsubscrbe1()
    router.publish('/user/456')
    expect(mockSubscriber).toBeCalledTimes(1)
  })
  it('supports overloads', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/user/:id/:name?', mockSubscriber)
    router.publish('/user/123', 'overload1', 'overload2')
    expect(mockSubscriber).toBeCalledTimes(1)
    expect(mockSubscriber).toBeCalledWith(
      { id: '123' },
      'overload1',
      'overload2',
    )
  })
})
