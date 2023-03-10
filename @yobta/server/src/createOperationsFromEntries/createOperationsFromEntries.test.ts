import {
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
} from '@yobta/protocol'

import { YobtaLogEntry } from '../createMemoryLog/createMemoryLog.js'
import { createOperationsFromEntries } from './createOperationsFromEntries.js'

const createEntry = (overload: Partial<YobtaLogEntry>): YobtaLogEntry => ({
  operationId: 'op-1',
  channel: 'ch-0',
  collection: 'col-0',
  snapshotId: 'sn-0',
  key: 'id',
  value: 'id-0',
  committed: 1,
  merged: 1,
  ...overload,
})

const createEntries = (overloads: Partial<YobtaLogEntry>[]): YobtaLogEntry[] =>
  overloads.map(createEntry)

describe('create operations from entries', () => {
  it('returns empty array on empty entries', () => {
    const entries: YobtaLogEntry[] = createEntries([])
    expect(createOperationsFromEntries(entries)).toEqual([])
  })
  it('merges entries of single update operation', () => {
    const entries: YobtaLogEntry[] = createEntries([
      { key: 'name', value: 'John' },
      { key: 'age', value: 21 },
      { key: 'gender', value: 'male' },
    ])
    const ops = createOperationsFromEntries(entries)
    expect(ops).toEqual([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'ch-0',
        data: { name: 'John', age: 21, gender: 'male' },
        snapshotId: 'sn-0',
        committed: 1,
        merged: 1,
      },
    ])
  })
  it('merges entries of single insert operation', () => {
    const entries: YobtaLogEntry[] = createEntries([
      { key: 'id', value: 'person-0' },
      { key: 'name', value: 'John' },
      { key: 'age', value: 21 },
      { key: 'gender', value: 'male' },
    ])
    const ops = createOperationsFromEntries(entries)
    expect(ops).toEqual([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'ch-0',
        data: { id: 'person-0', name: 'John', age: 21, gender: 'male' },
        snapshotId: 'sn-0',
        committed: 1,
        merged: 1,
      },
    ])
  })
  it('merges entries of several update operation', () => {
    const entries: YobtaLogEntry[] = createEntries([
      { key: 'name', value: 'John' },
      { key: 'age', value: 21 },
      { key: 'gender', value: 'male' },
      { key: 'name', value: 'Emmie', operationId: 'op-2' },
      { key: 'age', value: 20, operationId: 'op-2' },
      { key: 'gender', value: 'female', operationId: 'op-2' },
      { key: 'name', value: 'Tom', operationId: 'op-3' },
      { key: 'age', value: 15, operationId: 'op-3' },
    ])
    const ops = createOperationsFromEntries(entries)
    expect(ops).toEqual([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'ch-0',
        data: { name: 'John', age: 21, gender: 'male' },
        snapshotId: 'sn-0',
        committed: 1,
        merged: 1,
      },
      {
        id: 'op-2',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'ch-0',
        data: { name: 'Emmie', age: 20, gender: 'female' },
        snapshotId: 'sn-0',
        committed: 1,
        merged: 1,
      },
      {
        id: 'op-3',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'ch-0',
        data: { name: 'Tom', age: 15 },
        snapshotId: 'sn-0',
        committed: 1,
        merged: 1,
      },
    ])
  })
  it('merges entries of several update and insert operations', () => {
    const entries: YobtaLogEntry[] = createEntries([
      { key: 'name', value: 'John' },
      { key: 'age', value: 21 },
      { key: 'gender', value: 'male' },
      { key: 'id', value: 'person-1', operationId: 'op-2' },
      { key: 'name', value: 'Emmie', operationId: 'op-2' },
      { key: 'age', value: 20, operationId: 'op-2' },
      { key: 'gender', value: 'female', operationId: 'op-2' },
      { key: 'name', value: 'Tom', operationId: 'op-3' },
      { key: 'age', value: 15, operationId: 'op-3' },
    ])
    const ops = createOperationsFromEntries(entries)
    expect(ops).toEqual([
      {
        id: 'op-1',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'ch-0',
        data: { name: 'John', age: 21, gender: 'male' },
        snapshotId: 'sn-0',
        committed: 1,
        merged: 1,
      },
      {
        id: 'op-2',
        type: YOBTA_COLLECTION_INSERT,
        channel: 'ch-0',
        data: { id: 'person-1', name: 'Emmie', age: 20, gender: 'female' },
        snapshotId: 'sn-0',
        committed: 1,
        merged: 1,
      },
      {
        id: 'op-3',
        type: YOBTA_COLLECTION_UPDATE,
        channel: 'ch-0',
        data: { name: 'Tom', age: 15 },
        snapshotId: 'sn-0',
        committed: 1,
        merged: 1,
      },
    ])
  })
})
