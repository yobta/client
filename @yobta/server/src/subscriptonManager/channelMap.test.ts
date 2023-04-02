import { createChannelMap } from './channelMap.js'

let channelMap: any

beforeEach(() => {
  channelMap = createChannelMap()
})

afterEach(() => {
  channelMap.clear()
})

describe('add', () => {
  it('should add a client to a channel', () => {
    const added = channelMap.add('channel1', 'client1')
    expect(channelMap.keys()).toContain('channel1')
    expect(added).toBe(true)
  })
  it('should be idempotent for the same client and channel', () => {
    const added1 = channelMap.add('channel1', 'client1')
    const added2 = channelMap.add('channel1', 'client1')
    const added3 = channelMap.add('channel1', 'client2')

    expect(channelMap.keys()).toEqual(['channel1'])
    expect(added1).toBe(true)
    expect(added2).toBe(false)
    expect(added3).toBe(true)

    expect(channelMap.remove('channel1', 'client2')).toBe(false)
    expect(channelMap.remove('channel1', 'client2')).toBe(false)
    expect(channelMap.keys()).toEqual(['channel1'])

    expect(channelMap.remove('channel1', 'client1')).toBe(true)
    expect(channelMap.remove('channel1', 'client1')).toBe(false)
    expect(channelMap.keys()).toEqual([])
  })
})

describe('remove', () => {
  it('should remove a client from a channel and return true', () => {
    channelMap.add('channel1', 'client1')
    expect(channelMap.remove('channel1', 'client1')).toBe(true)
  })
  it('should return false if the client is not in the channel', () => {
    expect(channelMap.remove('channel1', 'client1')).toBe(false)
  })
  it('should be idempotent for the same client and channel', () => {
    channelMap.add('channel1', 'client1')
    expect(channelMap.remove('channel1', 'client1')).toBe(true)
    expect(channelMap.remove('channel1', 'client1')).toBe(false)
  })
})

describe('clear', () => {
  it('should clear all channels', () => {
    channelMap.add('channel1', 'client1')
    channelMap.add('channel2', 'client1')
    channelMap.clear()
    expect(channelMap.keys().length).toBe(0)
  })
})

describe('keys', () => {
  it('should return an array of channel names', () => {
    channelMap.add('channel1', 'client1')
    channelMap.add('channel2', 'client1')
    expect(channelMap.keys()).toEqual(['channel1', 'channel2'])
  })
})
