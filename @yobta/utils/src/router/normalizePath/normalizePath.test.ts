import { normalizePath } from './normalizePath.js'

it('trims the path', () => {
  expect(normalizePath(' /path ')).toBe('/path')
})
it('removes slash from the end of the path', () => {
  expect(normalizePath('/path/')).toBe('/path')
})
it('removes slashes from the end of the path', () => {
  expect(normalizePath('/path////')).toBe('/path')
})
it('returns slash if path is empty', () => {
  expect(normalizePath('')).toBe('/')
})
it('returns slash if path is slash', () => {
  expect(normalizePath('/')).toBe('/')
})
it('returns slash if path is only slashes', () => {
  expect(normalizePath('////')).toBe('/')
})
it('returns slash if path is only slashes and spaces', () => {
  expect(normalizePath('  ////  ')).toBe('/')
  expect(normalizePath('  / / / /  ')).toBe('/')
})
it('returns slash if path is only tabs', () => {
  expect(normalizePath('\t\t\t\t')).toBe('/')
})
it('returns slash if path is only newlines', () => {
  expect(normalizePath('\n\n\n')).toBe('/')
})

it('returns slash if path is only spaces', () => {
  expect(normalizePath('    ')).toBe('/')
})
it('respects case', () => {
  expect(normalizePath('/usEr/:ID')).toBe('/usEr/:ID')
})
