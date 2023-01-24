import { logYobta, YobtaLog } from '../log/log.js'
import {
  YobtaCollectionInsert,
  YOBTA_COLLECTION_INSERT,
} from '../protocol/protocol.js'
import { mergeLog } from './mergeLog.js'

describe('createProxyState', () => {
  let log: YobtaLog
  beforeEach(() => {
    log = logYobta([])
    log.add({
      id: 'op1',
      channel: 'channel1',
      type: YOBTA_COLLECTION_INSERT,
      time: 1,
      data: {
        id: 'id1',
        value: 'value1',
      },
    } as YobtaCollectionInsert)
    log.add({
      id: 'op2',
      channel: 'channel1',
      type: YOBTA_COLLECTION_INSERT,
      time: 2,
      data: {
        id: 'id2',
        value: 'value2',
      },
    } as YobtaCollectionInsert)
  })

  it('returns a Map of the correct type', () => {
    let state = new Map()
    mergeLog(state, log)
    expect(state).toBeInstanceOf(Map)
  })

  it('merges operations from the log', () => {
    let state = new Map()
    mergeLog(state, log)
    expect(state.get('id1')).toEqual({
      data: {
        id: 'id1',
        value: 'value1',
      },
      deleted: false,
    })
    expect(state.get('id2')).toEqual({
      data: {
        id: 'id2',
        value: 'value2',
      },
      deleted: false,
    })
  })

  it('sets the "deleted" property to false by default', () => {
    let state = new Map()
    mergeLog(state, log)
    expect(state.get('id1')?.deleted).toBe(false)
    expect(state.get('id2')?.deleted).toBe(false)
  })
})
