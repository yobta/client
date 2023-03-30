import { parseRoute } from '../parseRoute/parseRoute.js'
import { checkCollision, YobtaRouterHeap } from './checkCollision.js'

describe('static routes', () => {
  const route = '/path'
  const heap: YobtaRouterHeap = new Map()
  heap.set(route, {
    callbacks: new Set(),
    parsedRoute: parseRoute<string>(route),
  })
  it('allows to add new item', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path-1'))
    }).not.toThrow()
  })
  it('allows same route', () => {
    expect(() => {
      checkCollision(heap, parseRoute(route))
    }).not.toThrow()
  })
  it('allows same route with different formatting', () => {
    expect(() => {
      checkCollision(heap, parseRoute(' /path/ '))
    }).not.toThrow()
  })
  it('allows same static route with a param', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:id'))
    }).not.toThrow()
  })
  it('allows same static route with a param and optional', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:id?'))
    }).not.toThrow()
  })
  it('allows same static route with a param and optional', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:id/:name?'))
    }).not.toThrow()
  })
})

describe('static routes with params', () => {
  const route = '/path/:id'
  const heap: YobtaRouterHeap = new Map()
  heap.set(route, {
    callbacks: new Set(),
    parsedRoute: parseRoute<string>(route),
  })
  it('allows to add new item', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path-1'))
    }).not.toThrow()
  })
  it('allows same route', () => {
    expect(() => {
      checkCollision(heap, parseRoute(route))
    }).not.toThrow()
  })
  it('allows same route with different formatting', () => {
    expect(() => {
      checkCollision(heap, parseRoute(' /path/:id/ '))
    }).not.toThrow()
  })
  it('allows same static route with a param', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:id/:name'))
    }).not.toThrow()
  })
  it('allows same static route with a param and optional', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:id/:name?'))
    }).not.toThrow()
  })
  it('throws error if route conflicts', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:name'))
    }).toThrow()
  })
  it('throws error if route conflicts with optional param', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:id?'))
    }).toThrow()
  })
})

describe('static routes with optional params', () => {
  const route = '/path/:id?'
  const heap: YobtaRouterHeap = new Map()
  heap.set(route, {
    callbacks: new Set(),
    parsedRoute: parseRoute<string>(route),
  })
  it('allows to add new item', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/paz'))
    }).not.toThrow()
  })
  it('allows same route', () => {
    expect(() => {
      checkCollision(heap, parseRoute(route))
    }).not.toThrow()
  })
  it('allows same route with different formatting', () => {
    expect(() => {
      checkCollision(heap, parseRoute(' /path/:id?/ '))
    }).not.toThrow()
  })
  it('throws error if a param conflicts', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:id'))
    }).toThrow()
  })
  it('allows adding same route with optional param', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:id?/:name?'))
    }).not.toThrow()
  })
})

describe('required and optional params', () => {
  const route = '/path/:param1/:param2?'
  const heap: YobtaRouterHeap = new Map()
  heap.set(route, {
    callbacks: new Set(),
    parsedRoute: parseRoute<string>(route),
  })
  it('allows to add new item', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path'))
    }).not.toThrow()
  })
  it('allows same route', () => {
    expect(() => {
      checkCollision(heap, parseRoute(route))
    }).not.toThrow()
  })
  it('allows same route with different formatting', () => {
    expect(() => {
      checkCollision(heap, parseRoute(' /path/:param1/:param2?/ '))
    }).not.toThrow()
  })
  it('throws error if route conflicts', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:ha-ha'))
    }).toThrow()
    expect(() => {
      checkCollision(heap, parseRoute('/path/:ha/:ha?'))
    }).toThrow()
  })
  it('throws error if route conflicts with optional param', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:param1/:param2'))
    }).toThrow()
  })
  it('throws error if route conflicts with required param', () => {
    expect(() => {
      checkCollision(heap, parseRoute('/path/:param1'))
    }).toThrow()
  })
})
