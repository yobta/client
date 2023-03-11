import { parseRoute } from '../parseRoute/parseRoute.js'
import { getParams } from './getParams.js'

it('returns undefined if no match', () => {
  const route = parseRoute('/foo')
  const result = getParams(route, '/bar')
  expect(result).toBeUndefined()
})
it('returns empty params object if no params', () => {
  const route = parseRoute('/foo')
  const result = getParams(route, '/foo')
  expect(result).toEqual({})
})
it('returns undefined if no params and not matched', () => {
  const route = parseRoute('/foo')
  const result = getParams(route, '/bar')
  expect(result).toBeUndefined()
})
it('allows optional params to be not filled', () => {
  const route = parseRoute('/foo/:bar/:baz?')
  const result = getParams(route, '/foo/123')
  expect(result).toEqual({ bar: '123' })
})
it('extracts optional params', () => {
  const route = parseRoute('/foo/:bar?/:baz?')
  const result = getParams(route, '/foo/bar/baz')
  expect(result).toEqual({ bar: 'bar', baz: 'baz' })
})
it('respects route params case', () => {
  const route = parseRoute('/foo/:Bar/:Baz?')
  const result = getParams(route, '/foo/bar/baz')
  expect(result).toEqual({ Bar: 'bar', Baz: 'baz' })
})
it('respects url params case', () => {
  const route = parseRoute('/foo/:bar/:baz?')
  const result = getParams(route, '/foo/Bar/Baz')
  expect(result).toEqual({ bar: 'Bar', baz: 'Baz' })
})
