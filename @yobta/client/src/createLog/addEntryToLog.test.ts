import {
  YOBTA_COLLECTION_DELETE,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_MOVE,
  YOBTA_COLLECTION_RESTORE,
  YOBTA_REJECT,
} from '@yobta/protocol'

import { YobtaLogEntry } from './createLog.js'
import { addEntryToLog } from './addEntryToLog.js'

it('supports insert', () => {
  const log: YobtaLogEntry[] = []
  const entry: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_INSERT,
    'snapshot-1',
    undefined,
    undefined,
  ]
  const shouldUpdate = addEntryToLog(log, entry)
  expect(log).toEqual([entry])
  expect(shouldUpdate).toBe(true)
})
it('supports reject', () => {
  const log: YobtaLogEntry[] = []
  const entry: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    1,
    YOBTA_REJECT,
    undefined,
    undefined,
    'operation-2',
  ]
  const shouldUpdate = addEntryToLog(log, entry)
  expect(log).toEqual([entry])
  expect(shouldUpdate).toBe(true)
})
it('supports move', () => {
  const log: YobtaLogEntry[] = []
  const entry: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_MOVE,
    'snapshot-1',
    'snapshot-2',
    undefined,
  ]
  const shouldUpdate = addEntryToLog(log, entry)
  expect(log).toEqual([entry])
  expect(shouldUpdate).toBe(true)
})
it('supports delete', () => {
  const log: YobtaLogEntry[] = []
  const entry: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_DELETE,
    'snapshot-1',
    undefined,
    undefined,
  ]
  const shouldUpdate = addEntryToLog(log, entry)
  expect(log).toEqual([entry])
  expect(shouldUpdate).toBe(true)
})
it('supports restore', () => {
  const log: YobtaLogEntry[] = []
  const entry: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_RESTORE,
    'snapshot-1',
    undefined,
    undefined,
  ]
  const shouldUpdate = addEntryToLog(log, entry)
  expect(log).toEqual([entry])
  expect(shouldUpdate).toBe(true)
})
it('sorts a:1, b:2', () => {
  const a: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-1',
    undefined,
    undefined,
  ]
  const b: YobtaLogEntry = [
    'operation-2',
    'channel',
    2,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-2',
    undefined,
    undefined,
  ]
  const log: YobtaLogEntry[] = [a]
  const shouldUpdate = addEntryToLog(log, b)
  expect(log).toEqual([a, b])
  expect(shouldUpdate).toBe(true)
})
it('sorts a:1, b:1', () => {
  const a: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-1',
    undefined,
    undefined,
  ]
  const b: YobtaLogEntry = [
    'operation-2',
    'channel',
    1,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-2',
    undefined,
    undefined,
  ]
  const log: YobtaLogEntry[] = [a]
  const shouldUpdate = addEntryToLog(log, b)
  expect(log).toEqual([a, b])
  expect(shouldUpdate).toBe(true)
})
it('sorts a:2, b:1', () => {
  const a: YobtaLogEntry = [
    'operation-1',
    'channel',
    2,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-1',
    undefined,
    undefined,
  ]
  const b: YobtaLogEntry = [
    'operation-2',
    'channel',
    1,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-2',
    undefined,
    undefined,
  ]
  const log: YobtaLogEntry[] = [a]
  const shouldUpdate = addEntryToLog(log, b)
  expect(log).toEqual([b, a])
  expect(shouldUpdate).toBe(true)
})
it('resolves a:1, a:2', () => {
  const a1: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-1',
    undefined,
    undefined,
  ]
  const a2: YobtaLogEntry = [
    'operation-1',
    'channel',
    2,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-1',
    undefined,
    undefined,
  ]
  const log: YobtaLogEntry[] = [a1]
  const shouldUpdate = addEntryToLog(log, a2)
  expect(log).toEqual([a2])
  expect(shouldUpdate).toBe(true)
})
it('resolves a:1, a:1', () => {
  const a1: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-1',
    undefined,
    undefined,
  ]
  const a2: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-1',
    undefined,
    undefined,
  ]
  const log: YobtaLogEntry[] = [a1]
  const shouldUpdate = addEntryToLog(log, a2)
  expect(log).toEqual([a2])
  expect(shouldUpdate).toBe(true)
})
it('resolves a:m1, a:m0', () => {
  const a1: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    1,
    YOBTA_COLLECTION_INSERT,
    'shapshot-1',
    undefined,
    undefined,
  ]
  const a2: YobtaLogEntry = [
    'operation-1',
    'channel',
    1,
    0,
    YOBTA_COLLECTION_INSERT,
    'shapshot-1',
    undefined,
    undefined,
  ]
  const log: YobtaLogEntry[] = [a1]
  const shouldUpdate = addEntryToLog(log, a2)
  expect(log).toEqual([a1])
  expect(shouldUpdate).toBe(false)
})
