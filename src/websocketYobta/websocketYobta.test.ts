/* eslint-disable accessor-pairs */
import { vi, it, expect } from 'vitest'

import { websocketYobta } from './websocketYobta.js'

let closeMock = vi.fn()
let sendMock = vi.fn()

let onOpenMock = vi.fn()
let onMessageMock = vi.fn()
let onErrorMock = vi.fn()
let onCloseMock = vi.fn()

let readyState = 0

let WebsocketMock = vi.fn(() => ({
  close: closeMock,
  get readyState() {
    return readyState
  },
  send: sendMock,
  set onopen(fn: Function) {
    onOpenMock(fn)
  },
  set onmessage(fn: Function) {
    onMessageMock(fn)
  },
  set onerror(fn: Function) {
    onErrorMock(fn)
  },
  set onclose(fn: Function) {
    onCloseMock(fn)
  },
}))

vi.stubGlobal('WebSocket', WebsocketMock)

it('is quiet on init', () => {
  let ws = websocketYobta({ url: 'ws.la.la/la' })
  let spy = vi.fn()
  ws.observe(spy)
  expect(spy).not.toHaveBeenCalled()
  expect(WebSocket).not.toHaveBeenCalled()

  expect(onOpenMock).not.toHaveBeenCalled()
  expect(onMessageMock).not.toHaveBeenCalled()
  expect(onErrorMock).not.toHaveBeenCalled()
  expect(onCloseMock).not.toHaveBeenCalled()
})

it('connects with url', () => {
  let url = 'ws.la.la/la'
  let ws = websocketYobta({ url })
  let spy = vi.fn()
  ws.observe(spy)

  ws.connect()

  expect(spy).toHaveBeenCalledOnce()
  expect(spy).toHaveBeenCalledWith(['yobta_state', 'CONNECTING'])

  expect(WebSocket).toHaveBeenCalledOnce()
  expect(WebSocket).toHaveBeenCalledWith(url, undefined)
})

it('connects with url and protocols', () => {
  let url = 'ws.la.la/la'
  let protocols = 'a'
  let ws = websocketYobta({ url, protocols })

  ws.connect()

  expect(WebSocket).toHaveBeenCalledWith(url, protocols)
})

it('connects once', () => {
  let ws = websocketYobta({ url: 'ws.la.la/la' })
  let spy = vi.fn()
  ws.observe(spy)

  ws.connect()
  ws.connect()

  expect(spy).toHaveBeenCalledOnce()
  expect(WebSocket).toHaveBeenCalledOnce()
})

it('disconnects when connected', () => {
  let ws = websocketYobta({ url: 'ws.la.la/la' })
  let spy = vi.fn()
  ws.observe(spy)

  ws.connect()
  ws.disconnect()

  expect(spy).toHaveBeenCalledTimes(2)
  expect(spy).toHaveBeenCalledWith(['yobta_state', 'CONNECTING'])
  expect(spy).toHaveBeenCalledWith(['yobta_state', 'CLOSING'])

  expect(closeMock).toHaveBeenCalledOnce()
})

it('subscribes when connected', () => {
  let ws = websocketYobta({ url: 'ws.la.la/la' })
  let spy = vi.fn()
  ws.observe(spy)

  ws.connect()

  expect(onOpenMock).toHaveBeenCalledOnce()
  expect(onMessageMock).toHaveBeenCalledOnce()
  expect(onErrorMock).toHaveBeenCalledOnce()
  expect(onCloseMock).toHaveBeenCalledOnce()

  onOpenMock.mock.calls[0][0]('yobta')
  onMessageMock.mock.calls[0][0]({ data: 'yobta' })
  onErrorMock.mock.calls[0][0]('yobta')
  onCloseMock.mock.calls[0][0]('yobta')

  expect(spy).toHaveBeenCalledWith(['yobta_state', 'OPEN', 'yobta'])
  expect(spy).toHaveBeenCalledWith(['yobta_message', 'yobta'])
  expect(spy).toHaveBeenCalledWith(['yobta_state', 'ERROR', 'yobta'])
  expect(spy).toHaveBeenCalledWith(['yobta_state', 'CLOSED', 'yobta'])
})

it('sends when connected', () => {
  let ws = websocketYobta({ url: 'ws.la.la/la' })
  let spy = vi.fn()

  ws.observe(spy)
  ws.connect()

  readyState = 1

  ws.send('yobta')

  expect(sendMock).toHaveBeenCalledWith('yobta')
})

it('throws when sending to not connected', () => {
  let ws = websocketYobta({ url: 'ws.la.la/la' })
  let spy = vi.fn()

  ws.observe(spy)

  expect(() => {
    ws.send('yobta')
  }).toThrow('Please connect before sending')
})

it('throws when sending to not ready', () => {
  let ws = websocketYobta({ url: 'ws.la.la/la' })
  let spy = vi.fn()

  ws.observe(spy)
  ws.connect()

  readyState = 0

  expect(() => {
    ws.send('yobta')
  }).toThrow('Websocket is not ready')
})
