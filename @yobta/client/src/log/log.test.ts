// import { YobtaDataOperation, YOBTA_COLLECTION_DELETE } from '@yobta/protocol'

import { logYobta } from './log.js'

// it('adds first operation', () => {
//   const log = logYobta([])
//   const version = log.version
//   expect(log.last()).toBeUndefined()
//   const operation: YobtaDataOperation = {
//     id: '1',
//     channel: 'test',
//     committed: 1,
//     merged: 1,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '2',
//   }
//   log.add(operation)
//   expect([...log.values()]).toEqual([operation])
//   expect(log.last()).toEqual(operation)
//   expect(log.version).not.toEqual(version)
// })

// it('adds second operation', () => {
//   const log = logYobta([])
//   let version = log.version
//   const operation1: YobtaDataOperation = {
//     id: '1',
//     channel: 'test',
//     committed: 1,
//     merged: 1,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '2',
//   }
//   const operation2: YobtaDataOperation = {
//     id: '2',
//     channel: 'test',
//     committed: 2,
//     merged: 2,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '1',
//   }
//   log.add(operation1)
//   expect(log.version).not.toEqual(version)
//   version = log.version
//   log.add(operation2)
//   expect(log.version).not.toEqual(version)
//   expect([...log.values()]).toEqual([operation1, operation2])
//   expect(log.last()).toEqual(operation2)
// })

// it('preserves order when operartion time is equal', () => {
//   const log = logYobta([])
//   let version = log.version

//   const operation1: YobtaDataOperation = {
//     id: '1',
//     channel: 'test',
//     committed: 1,
//     merged: 1,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '2',
//   }
//   const operation2: YobtaDataOperation = {
//     id: '2',
//     channel: 'test',
//     committed: 1,
//     merged: 1,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '1',
//   }
//   log.add(operation1)
//   expect(log.version).not.toEqual(version)
//   version = log.version

//   log.add(operation2)
//   expect(log.version).not.toEqual(version)
//   expect([...log.values()]).toEqual([operation1, operation2])
//   expect(log.last()).toEqual(operation2)
// })

// it('orders unordered operations', () => {
//   const log = logYobta([])
//   const operation1: YobtaDataOperation = {
//     id: '1',
//     channel: 'test',
//     committed: 2,
//     merged: 2,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '2',
//   }
//   const operation2: YobtaDataOperation = {
//     id: '2',
//     channel: 'test',
//     committed: 1,
//     merged: 1,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '1',
//   }
//   log.add(operation1)
//   log.add(operation2)
//   expect([...log.values()]).toEqual([operation2, operation1])
//   expect(log.last()).toBeUndefined()
// })

// it('overwrites when operation is added twice', () => {
//   const log = logYobta([])
//   const operation1: YobtaDataOperation = {
//     id: '1',
//     channel: 'test',
//     committed: 1,
//     merged: 1,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '2',
//   }
//   const operation2: YobtaDataOperation = {
//     id: '1',
//     channel: 'test',
//     committed: 2,
//     merged: 2,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '1',
//   }
//   log.add(operation1)
//   log.add(operation2)
//   expect([...log.values()]).toEqual([operation2])
//   expect(log.last()).toEqual(operation2)
// })

// it('removes operation', () => {
//   const log = logYobta([])
//   const version = log.version
//   const operation: YobtaDataOperation = {
//     id: '1',
//     channel: 'test',
//     committed: 1,
//     merged: 1,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '2',
//   }
//   log.add(operation)
//   expect(log.version).not.toEqual(version)
//   expect(log.remove(operation.id)).toEqual(operation)
//   expect([...log.values()]).toEqual([])
//   expect(log.last()).toBeUndefined()
// })
// it('removes operations from top to bottom', () => {
//   const log = logYobta([])
//   const operation1: YobtaDataOperation = {
//     id: '1',
//     channel: 'test',
//     committed: 1,
//     merged: 1,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '2',
//   }
//   const operation2: YobtaDataOperation = {
//     id: '2',
//     channel: 'test',
//     committed: 2,
//     merged: 2,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '1',
//   }
//   log.add(operation1)
//   log.add(operation2)
//   const version = log.version
//   expect(log.remove(operation1.id)).toEqual(operation1)
//   expect(log.version).not.toEqual(version)
//   expect([...log.values()]).toEqual([operation2])
//   expect(log.last()).toBeUndefined()
//   expect(log.remove(operation2.id)).toEqual(operation2)
//   expect([...log.values()]).toEqual([])
//   expect(log.last()).toBeUndefined()
// })
// it('removes operations from bottom to top', () => {
//   const log = logYobta([])
//   const operation1: YobtaDataOperation = {
//     id: '1',
//     channel: 'test',
//     committed: 1,
//     merged: 1,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '2',
//   }
//   const operation2: YobtaDataOperation = {
//     id: '2',
//     channel: 'test',
//     committed: 2,
//     merged: 2,
//     data: {},
//     type: YOBTA_COLLECTION_DELETE,
//     ref: '1',
//   }
//   log.add(operation1)
//   log.add(operation2)
//   expect(log.remove(operation2.id)).toEqual(operation2)
//   expect([...log.values()]).toEqual([operation1])
//   expect(log.last()).toBeUndefined()
//   expect(log.remove(operation1.id)).toEqual(operation1)
//   expect([...log.values()]).toEqual([])
//   expect(log.last()).toBeUndefined()
// })

it('returns undefined when operation is not found', () => {
  const log = logYobta([])
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
