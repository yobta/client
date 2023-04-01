import {
  getServerTime,
  trackClientTime,
  trackServerTime,
} from './serverTime.js'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('returns current time when empty', () => {
  vi.setSystemTime(new Date(2000, 1, 1, 13))
  const serverTime = getServerTime()
  expect(new Date(serverTime)).toEqual(new Date(2000, 1, 1, 13))
})

it('returns current time when knows only client time', () => {
  vi.setSystemTime(new Date(2000, 1, 1, 13))
  trackClientTime('operation-1')
  const serverTime = getServerTime()
  expect(new Date(serverTime)).toEqual(new Date(2000, 1, 1, 13))
})

it('returns server time when knows client and server time', () => {
  vi.setSystemTime(new Date('2000-02-01T13:00:00.000Z'))
  trackClientTime('operation-1')
  vi.setSystemTime(new Date('2000-02-01T13:00:02.000Z'))
  trackServerTime('operation-1', new Date('2000-02-01T13:00:01.000Z').getTime())
  const serverTime = getServerTime()
  expect(new Date(serverTime)).toEqual(new Date('2000-02-01T13:00:02.000Z'))
})

it('resolves well when client time is ahead of server', () => {
  vi.setSystemTime(new Date('2000-02-01T13:00:00.000Z'))
  trackClientTime('operation-1')
  vi.setSystemTime(new Date('2000-02-01T13:00:02.000Z'))
  trackServerTime('operation-1', new Date('2000-02-01T12:00:01.000Z').getTime())
  const serverTime = getServerTime()
  expect(new Date(serverTime)).toEqual(new Date('2000-02-01T12:00:02.000Z'))
})

it('resolves well when client time is behind of server', () => {
  vi.setSystemTime(new Date('2000-02-01T13:00:00.000Z'))
  trackClientTime('operation-1')
  vi.setSystemTime(new Date('2000-02-01T13:00:02.000Z'))
  trackServerTime('operation-1', new Date('2000-02-01T14:00:01.000Z').getTime())
  const serverTime = getServerTime()
  expect(new Date(serverTime)).toEqual(new Date('2000-02-01T14:00:02.000Z'))
})

it('returns false when server time is was not tracked', () => {
  const result = trackServerTime('operation-1', 123)
  expect(result).toBe(false)
})

it('returns true when server time is tracked', () => {
  trackClientTime('operation-1')
  const result = trackServerTime('operation-1', 123)
  expect(result).toBe(true)
})
