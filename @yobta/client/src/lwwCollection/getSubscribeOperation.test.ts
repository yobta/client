import { createOperationYobta } from '../createOperation/createOperation.js'
import { logYobta } from '../log/log.js'
import {
  YOBTA_SUBSCRIBE,
  YobtaCollectionInsert,
  YOBTA_COLLECTION_INSERT,
} from '../protocol/protocol.js'
import { getSubscribeOperation } from './getSubscribeOperation.js'

describe('getSubscribeOperation', () => {
  it('should return a YobtaSubscribe object with the correct properties', () => {
    let channel = 'myChannel'
    let createOperation = createOperationYobta<YobtaCollectionInsert>({
      channel: 'myChannel',
      time: 42,
      type: YOBTA_COLLECTION_INSERT,
      data: { id: 'myId', value: 'myValue' },
    })
    let log = logYobta([createOperation])
    let subscribeOperation = getSubscribeOperation(channel, log)
    expect(subscribeOperation).toEqual({
      id: expect.any(String),
      channel: 'myChannel',
      type: YOBTA_SUBSCRIBE,
      time: expect.any(Number),
      version: 42,
    })
  })
})
