import { vi, expect } from 'vitest'

import { internetConnectionYobta } from './internetConnectionYobta.js'

it('is true when navigator is online', () => {
  vi.stubGlobal('navigator', { onLine: true })
  let store = internetConnectionYobta()
  expect(store.last()).toBe(true)
})

it('is false when navigator is offline', () => {
  vi.stubGlobal('navigator', { onLine: false })
  let store = internetConnectionYobta()
  expect(store.last()).toBe(false)
})

it('is null when window in undefined', () => {
  vi.stubGlobal('window', undefined)
  let store = internetConnectionYobta()

  expect(store.last()).toBeNull()
})

it('adds event listeners to window', () => {
  let addEventListener = vi.fn()
  vi.stubGlobal('window', { addEventListener })
  vi.stubGlobal('navigator', { onLine: false })

  let store = internetConnectionYobta()

  expect(window.addEventListener).toHaveBeenCalledTimes(2)
  expect(addEventListener.mock.calls[0][0]).toBe('online')
  expect(addEventListener.mock.calls[1][0]).toBe('offline')

  addEventListener.mock.calls[0][1]()
  expect(store.last()).toBe(true)

  addEventListener.mock.calls[1][1]()
  expect(store.last()).toBe(false)
})
