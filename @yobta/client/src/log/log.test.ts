import {
  YobtaDataOperation,
  YOBTA_COLLECTION_DELETE,
} from '../protocol/protocol.js'
import { logYobta } from './log.js'

it('adds first operation', () => {
  let log = logYobta([])
  let version = log.version
  expect(log.last()).toBeUndefined()
  let operation: YobtaDataOperation = {
    id: '1',
    channel: 'test',
    time: 1,
    type: YOBTA_COLLECTION_DELETE,
    ref: '2',
  }
  log.add(operation)
  expect([...log.values()]).toEqual([operation])
  expect(log.last()).toEqual(operation)
  expect(log.version).not.toEqual(version)
})

it('adds second operation', () => {
  let log = logYobta([])
  let version = log.version
  let operation1: YobtaDataOperation = {
    id: '1',
    channel: 'test',
    time: 1,
    type: YOBTA_COLLECTION_DELETE,
    ref: '2',
  }
  let operation2: YobtaDataOperation = {
    id: '2',
    channel: 'test',
    time: 2,
    type: YOBTA_COLLECTION_DELETE,
    ref: '1',
  }
  log.add(operation1)
  expect(log.version).not.toEqual(version)
  version = log.version
  log.add(operation2)
  expect(log.version).not.toEqual(version)
  expect([...log.values()]).toEqual([operation1, operation2])
  expect(log.last()).toEqual(operation2)
})

it('preserves order when operartion time is equal', () => {
  let log = logYobta([])
  let version = log.version

  let operation1: YobtaDataOperation = {
    id: '1',
    channel: 'test',
    time: 1,
    type: YOBTA_COLLECTION_DELETE,
    ref: '2',
  }
  let operation2: YobtaDataOperation = {
    id: '2',
    channel: 'test',
    time: 1,
    type: YOBTA_COLLECTION_DELETE,
    ref: '1',
  }
  log.add(operation1)
  expect(log.version).not.toEqual(version)
  version = log.version

  log.add(operation2)
  expect(log.version).not.toEqual(version)
  expect([...log.values()]).toEqual([operation1, operation2])
  expect(log.last()).toEqual(operation2)
})

it('orders unordered operations', () => {
  let log = logYobta([])
  let operation1: YobtaDataOperation = {
    id: '1',
    channel: 'test',
    time: 2,
    type: YOBTA_COLLECTION_DELETE,
    ref: '2',
  }
  let operation2: YobtaDataOperation = {
    id: '2',
    channel: 'test',
    time: 1,
    type: YOBTA_COLLECTION_DELETE,
    ref: '1',
  }
  log.add(operation1)
  log.add(operation2)
  expect([...log.values()]).toEqual([operation2, operation1])
  expect(log.last()).toBeUndefined()
})

it('overwrites when operation is added twice', () => {
  let log = logYobta([])
  let operation1: YobtaDataOperation = {
    id: '1',
    channel: 'test',
    time: 1,
    type: YOBTA_COLLECTION_DELETE,
    ref: '2',
  }
  let operation2: YobtaDataOperation = {
    id: '1',
    channel: 'test',
    time: 2,
    type: YOBTA_COLLECTION_DELETE,
    ref: '1',
  }
  log.add(operation1)
  log.add(operation2)
  expect([...log.values()]).toEqual([operation2])
  expect(log.last()).toEqual(operation2)
})

it('removes operation', () => {
  let log = logYobta([])
  let version = log.version
  let operation: YobtaDataOperation = {
    id: '1',
    channel: 'test',
    time: 1,
    type: YOBTA_COLLECTION_DELETE,
    ref: '2',
  }
  log.add(operation)
  expect(log.version).not.toEqual(version)
  expect(log.remove(operation.id)).toEqual(operation)
  expect([...log.values()]).toEqual([])
  expect(log.last()).toBeUndefined()
})
it('removes operations from top to bottom', () => {
  let log = logYobta([])
  let operation1: YobtaDataOperation = {
    id: '1',
    channel: 'test',
    time: 1,
    type: YOBTA_COLLECTION_DELETE,
    ref: '2',
  }
  let operation2: YobtaDataOperation = {
    id: '2',
    channel: 'test',
    time: 2,
    type: YOBTA_COLLECTION_DELETE,
    ref: '1',
  }
  log.add(operation1)
  log.add(operation2)
  let version = log.version
  expect(log.remove(operation1.id)).toEqual(operation1)
  expect(log.version).not.toEqual(version)
  expect([...log.values()]).toEqual([operation2])
  expect(log.last()).toBeUndefined()
  expect(log.remove(operation2.id)).toEqual(operation2)
  expect([...log.values()]).toEqual([])
  expect(log.last()).toBeUndefined()
})
it('removes operations from bottom to top', () => {
  let log = logYobta([])
  let operation1: YobtaDataOperation = {
    id: '1',
    channel: 'test',
    time: 1,
    type: YOBTA_COLLECTION_DELETE,
    ref: '2',
  }
  let operation2: YobtaDataOperation = {
    id: '2',
    channel: 'test',
    time: 2,
    type: YOBTA_COLLECTION_DELETE,
    ref: '1',
  }
  log.add(operation1)
  log.add(operation2)
  expect(log.remove(operation2.id)).toEqual(operation2)
  expect([...log.values()]).toEqual([operation1])
  expect(log.last()).toBeUndefined()
  expect(log.remove(operation1.id)).toEqual(operation1)
  expect([...log.values()]).toEqual([])
  expect(log.last()).toBeUndefined()
})

it('returns undefined when operation is not found', () => {
  let log = logYobta([])
  expect(log.remove('1')).toEqual(undefined)
})

// it('adds fast', () => {
//   let log = logYobta([])
//   for (let i = 0; i < 160000; i++) {
//     log.add({
//       id: String(i),
//       channel: 'test',
//       time: i,
//       type: YOBTA_COLLECTION_DELETE,
//       ref: i + 1,
//     })
//   }
//   let start = performance.now()
//   let version = log.last()?.time || 0
//   let additions = 5
//   for (let i = 0; i < additions; i++) {
//     log.add({
//       id: String(i),
//       channel: 'test',
//       time: Math.random() * version,
//       type: YOBTA_COLLECTION_DELETE,
//       ref: i + 1,
//     })
//   }
//   let end = performance.now()
//   let operartionTime = (end - start) / additions
//   expect(operartionTime).toBeLessThan(16)
// })
