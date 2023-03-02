import { vi } from 'vitest'

import { createRouter } from './createRouter.js'

describe('create router', () => {
  it('creates router instance without errors', () => {
    const router = createRouter()
    expect(router).toMatchObject({
      subscribe: expect.any(Function),
      publish: expect.any(Function),
    })
  })

  it('subscribe and publish without dynamical params', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/user/123', mockSubscriber)
    router.publish('/user/123', 'data', 'ovrl1', 'ovrl2')
    expect(mockSubscriber).toBeCalledTimes(1)
    expect(mockSubscriber).toBeCalledWith({}, 'data', 'ovrl1', 'ovrl2')
  })

  it('subscribe and publish with dynamical params', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()
    router.subscribe('/user/:id', mockSubscriber)
    router.publish('/user/123', 'data', 'ovrl1', 'ovrl2')
    expect(mockSubscriber).toBeCalledTimes(1)
    expect(mockSubscriber).toBeCalledWith(
      { id: '123' },
      'data',
      'ovrl1',
      'ovrl2',
    )
  })

  it('doesn`t handle unmatched publish', () => {
    const router = createRouter()
    const mockSubscriber = vi.fn()

    router.subscribe('/user/:id', mockSubscriber)

    router.publish('/user/123/name', 'data', 'ovrl1', 'ovrl2')

    expect(mockSubscriber).not.toBeCalled()
  })
})
