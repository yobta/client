import {
  YOBTA_SUBSCRIBE,
  YobtaCollectionInsert,
  YOBTA_COLLECTION_INSERT,
} from '@yobta/protocol'

import { createOperationYobta } from '../createOperation/createOperation.js'
import { logYobta } from '../log/log.js'
import { getSubscribeOperation } from './getSubscribeOperation.js'

describe('getSubscribeOperation', () => {
  it('should return a YobtaSubscribe object with the correct properties', () => {
    const channel = 'myChannel'
    const createOperation = createOperationYobta<YobtaCollectionInsert>({
      channel: 'myChannel',
      time: 42,
      type: YOBTA_COLLECTION_INSERT,
      data: { id: 'myId', value: 'myValue' },
    })
    const log = logYobta([createOperation])
    const subscribeOperation = getSubscribeOperation(channel, log)
    expect(subscribeOperation).toEqual({
      id: expect.any(String),
      channel: 'myChannel',
      type: YOBTA_SUBSCRIBE,
      time: expect.any(Number),
      version: 42,
    })
  })
})
