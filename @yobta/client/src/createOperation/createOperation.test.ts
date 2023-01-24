import { YOBTA_COMMIT } from '../protocol/protocol.js'
import { createOperationYobta } from './createOperation.js'

it('should generate an operation with a unique ID', () => {
  let op1 = createOperationYobta({ type: YOBTA_COMMIT })
  let op2 = createOperationYobta({ type: YOBTA_COMMIT })

  expect(op1.id).not.toEqual(op2.id)
})

it('should generate an operation with the current time', () => {
  let op = createOperationYobta({ type: YOBTA_COMMIT })

  expect(op.time).toBeCloseTo(Date.now(), -3)
})

it('should generate an operation with the correct type', () => {
  let op = createOperationYobta({ type: YOBTA_COMMIT })

  expect(op.type).toEqual(YOBTA_COMMIT)
})

it('should generate an operation with the provided data', () => {
  let op = createOperationYobta({ type: YOBTA_COMMIT, id: 'op1', time: 2 })

  expect(op).toEqual({ id: 'op1', time: 2, type: YOBTA_COMMIT })
})
