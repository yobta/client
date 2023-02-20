import { vi, it } from 'vitest'
import { YOBTA_SUBSCRIBE } from '@yobta/protocol'

import { logYobta } from '../log/log.js'
import { getAllSubscribeOperarions } from './getAllSubscribeOperarions.js'

vi.mock('./subscriptions.js', () => ({
  subscriptionsStore: {
    entries() {
      return [
        ['channel1', { committed: logYobta([]) }],
        ['channel2', { committed: logYobta([]) }],
      ]
    },
  },
}))

it('returns an array of YobtaSubscribe messages', () => {
  const result = getAllSubscribeOperarions()

  expect(result).toEqual([
    {
      id: expect.any(String),
      channel: 'channel1',
      time: expect.any(Number),
      type: YOBTA_SUBSCRIBE,
      version: 0,
    },
    {
      id: expect.any(String),
      channel: 'channel2',
      time: expect.any(Number),
      type: YOBTA_SUBSCRIBE,
      version: 0,
    },
  ])
})
