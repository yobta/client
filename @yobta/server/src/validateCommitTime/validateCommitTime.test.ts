import { validateCommitTime } from './validateCommitTime.js'

it('returns same value if valid', () => {
  const time = Date.now() / 2
  const result = validateCommitTime(time)
  expect(result).toBe(time)
})

it('returns current time if invalid', () => {
  const time = Date.now() * 2
  const result = validateCommitTime(time)
  expect(result).toBeLessThan(time)
})

it('returns current time if NaN', () => {
  const time = NaN
  const result = validateCommitTime(time)
  expect(result).not.toBeNaN()
})

it('returns current time if Infinity', () => {
  const time = Infinity
  const result = validateCommitTime(time)
  expect(result).toBeLessThan(time)
})

it('returns current time if -Infinity', () => {
  const time = -Infinity
  const result = validateCommitTime(time)
  expect(result).toBeGreaterThan(time)
})
