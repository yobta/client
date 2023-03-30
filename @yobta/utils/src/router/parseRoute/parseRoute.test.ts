import { parseRoute } from './parseRoute.js'

it('has no params', () => {
  const parsedRoute = parseRoute('/foo')
  expect(parsedRoute).toEqual({
    id: '/foo',
    paramNames: [],
    regex: expect.any(RegExp),
    route: '/foo',
  })
})
it('has required params', () => {
  const parsedRoute = parseRoute('/foo/:bar/:baz')
  expect(parsedRoute).toEqual({
    id: '/foo/:bar/:baz',
    paramNames: ['bar', 'baz'],
    regex: expect.any(RegExp),
    route: '/foo/:bar/:baz',
  })
})
it('has optional params', () => {
  const parsedRoute = parseRoute('/foo/:bar?/:baz?')
  expect(parsedRoute).toEqual({
    id: '/foo/:bar?/:baz?',
    paramNames: ['bar', 'baz'],
    regex: expect.any(RegExp),
    route: '/foo/:bar?/:baz?',
  })
})
it('lowercases id, but not param names', () => {
  const parsedRoute = parseRoute('/FOO/:BAR?/:BAZ?')
  expect(parsedRoute).toEqual({
    id: '/foo/:bar?/:baz?',
    paramNames: ['BAR', 'BAZ'],
    regex: expect.any(RegExp),
    route: '/FOO/:BAR?/:BAZ?',
  })
})
