import { createLogVersionGetter } from './createLogVersionGetter.js'

test('should return a function', () => {
  const getState = (): any => []
  const logVersionGetter = createLogVersionGetter(getState)
  expect(typeof logVersionGetter).toBe('function')
})

test('should return 0 when no operations are given', () => {
  const getState = (): any => []
  const logVersionGetter = createLogVersionGetter(getState)
  expect(logVersionGetter()).toBe(0)
})
test('should return the correct version number based on the provided state with operations sorted by committed', () => {
  const state = [
    { committed: 1, merged: 2 },
    { committed: 2, merged: 4 },
    { committed: 3, merged: 1 },
  ]
  const getState = (): any => state
  const logVersionGetter = createLogVersionGetter(getState)
  expect(logVersionGetter()).toBe(4)
})
