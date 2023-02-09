import { YobtaDataOperation, YobtaOperationId } from '@yobta/protocol'

interface YobtaLogFactory {
  (initialState: YobtaDataOperation[]): {
    add(...operations: YobtaDataOperation[]): void
    values: Log['values']
    remove(operationId: YobtaOperationId): YobtaDataOperation | undefined
    last(): YobtaDataOperation | undefined
    version: symbol
  }
}

type Add = YobtaLog['add']
type Log = Map<YobtaOperationId, YobtaDataOperation>
type Tail = Set<YobtaDataOperation>

export type YobtaLog = ReturnType<YobtaLogFactory>

export const logYobta: YobtaLogFactory = initialState => {
  let version = Symbol()
  const log: Log = new Map()
  let lastOperationId: YobtaOperationId
  let wasSorted = true
  const append = (op: YobtaDataOperation): void => {
    log.set(op.id, op)
    lastOperationId = op.id
  }
  const add: Add = (...operations) => {
    operations.forEach(op => {
      const tail: Tail = new Set()
      wasSorted = false
      if (Number(log.get(lastOperationId)?.time) > op.time) {
        log.forEach(stored => {
          if (stored.time > op.time) {
            tail.add(stored)
            log.delete(stored.id)
          }
        })
        wasSorted = true
      }
      append(op)
      tail.forEach(append)
    })
    version = Symbol()
    if (operations.length > 1) wasSorted = true
  }
  add(...initialState)
  return {
    add,
    get version() {
      return version
    },
    values: () => log.values(),
    last() {
      return wasSorted ? undefined : log.get(lastOperationId)
    },
    remove(operationId) {
      const op = log.get(operationId)
      log.delete(operationId)
      wasSorted = true
      version = Symbol()
      return op
    },
  }
}
