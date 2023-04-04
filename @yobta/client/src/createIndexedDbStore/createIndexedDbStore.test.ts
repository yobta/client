import { YOBTA_REJECT, YobtaRejectOperation } from '@yobta/protocol'

import { createIndexedDbStore } from './createIndexedDbStore.js'

const scope = 'test'
const version = 1
const store = createIndexedDbStore(scope, version)

afterEach(async () => {
  await store.clear()
})

describe('basics', () => {
  it('creates a memory store', () => {
    expect(store).toEqual({
      fetch: expect.any(Function),
      put: expect.any(Function),
      clear: expect.any(Function),
    })
  })
  it('fetches empty array when not populated', async () => {
    const operations = await store.fetch()
    expect(operations).toEqual([])
  })
  it('fetches operations when populated', async () => {
    const operationA: YobtaRejectOperation = {
      id: 'op-2',
      channel: 'channel-a',
      type: YOBTA_REJECT,
      operationId: 'op-1',
      committed: 1,
      merged: 1,
      reason: 'a',
    }
    const operationB: YobtaRejectOperation = {
      id: 'op-3',
      channel: 'channel-b',
      type: YOBTA_REJECT,
      operationId: 'op-2',
      committed: 2,
      merged: 2,
      reason: 'a',
    }
    await store.put([operationA, operationB])
    const operationsA = await store.fetch('channel-a')
    const operationsB = await store.fetch('channel-b')
    const allOperations = await store.fetch()
    expect(operationsA).toEqual([operationA])
    expect(operationsB).toEqual([operationB])
    expect(allOperations).toEqual([operationA, operationB])
  })
  it('clears operations', async () => {
    const operationA: YobtaRejectOperation = {
      id: 'op-2',
      channel: 'channel-a',
      type: YOBTA_REJECT,
      operationId: 'op-1',
      committed: 1,
      merged: 1,
      reason: 'a',
    }
    const operationB: YobtaRejectOperation = {
      id: 'op-3',
      channel: 'channel-b',
      type: YOBTA_REJECT,
      operationId: 'op-2',
      committed: 2,
      merged: 2,
      reason: 'a',
    }
    await store.put([operationA, operationB])
    await store.clear()
    const operations = await store.fetch()
    const operationsA = await store.fetch('channel-a')
    const operationsB = await store.fetch('channel-b')
    expect(operations).toEqual([])
    expect(operationsA).toEqual([])
    expect(operationsB).toEqual([])
  })
})

describe('resolutions', () => {
  it('resolves ch1, ch2', async () => {
    const op1: YobtaRejectOperation = {
      id: 'op-1',
      channel: 'ch1',
      type: YOBTA_REJECT,
      operationId: 'op-1',
      committed: 1,
      merged: 1,
      reason: 'a',
    }
    const op2: YobtaRejectOperation = {
      id: 'op-2',
      channel: 'ch2',
      type: YOBTA_REJECT,
      operationId: 'op-2',
      committed: 2,
      merged: 2,
      reason: 'a',
    }
    await store.put([op1, op2])
    const read1 = await store.fetch('ch1')
    const read2 = await store.fetch('ch2')
    const readAll = await store.fetch()
    expect(read1).toEqual([op1])
    expect(read2).toEqual([op2])
    expect(readAll).toEqual([op1, op2])
  })
  it('resolves c1, c1', async () => {
    const op1: YobtaRejectOperation = {
      id: 'op-1',
      channel: 'ch-1',
      type: YOBTA_REJECT,
      operationId: 'op-1',
      committed: 1,
      merged: 0,
      reason: 'a',
    }
    const op2: YobtaRejectOperation = {
      id: 'op-1',
      channel: 'ch-1',
      type: YOBTA_REJECT,
      operationId: 'op-1',
      committed: 2,
      merged: 0,
      reason: 'a',
    }
    await store.put([op1, op2])
    const read1 = await store.fetch('ch-1')
    const readAll = await store.fetch()
    expect(read1).toEqual([op1])
    expect(readAll).toEqual([op1])
  })
  it('resolves c1, m1', async () => {
    const op1: YobtaRejectOperation = {
      id: 'op-1',
      channel: 'c1',
      type: YOBTA_REJECT,
      operationId: 'op-1',
      committed: 1,
      merged: 0,
      reason: 'a',
    }
    const op2: YobtaRejectOperation = {
      id: 'op-1',
      channel: 'c1',
      type: YOBTA_REJECT,
      operationId: 'op-1',
      committed: 2,
      merged: 2,
      reason: 'a',
    }
    await store.put([op1, op2])
    const read1 = await store.fetch('c1')
    const readAll = await store.fetch()
    expect(read1).toEqual([op2])
    expect(readAll).toEqual([op2])
  })
})
