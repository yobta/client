import {
  serverTimeCompensator,
  computeServerTime,
  getServerTime,
} from './serverTime.js'

beforeEach(() => {
  serverTimeCompensator.next(0)
})

it('should initialize with a value of 0', () => {
  expect(serverTimeCompensator.last()).toBe(0)
})

it('should update the value of serverTimeCompensator', () => {
  computeServerTime(100, 110)
  expect(serverTimeCompensator.last()).not.toBe(0)
})

it('should return the current time plus the value of serverTimeCompensator', () => {
  serverTimeCompensator.next(10)
  expect(getServerTime()).toBeCloseTo(Date.now() + 10, -20)
})
