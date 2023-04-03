import { YOBTA_REJECT, YobtaRejectOperation } from '@yobta/protocol'

import { createMemoryStore } from './createMemoryStore.js'

it('creates a memory store', () => {
  const store = createMemoryStore()
  expect(store).toEqual({
    fetch: expect.any(Function),
    put: expect.any(Function),
    clear: expect.any(Function),
  })
})

it('fetches empty array when not populated', async () => {
  const store = createMemoryStore()
  const operations = await store.fetch()
  expect(operations).toEqual([])
})

it('fetches operations when populated', async () => {
  const store = createMemoryStore()
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
  const store = createMemoryStore()
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
