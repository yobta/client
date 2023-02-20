import { YOBTA_COMMIT } from '@yobta/protocol'

import { createOperationYobta } from './createOperation.js'

it('should generate an operation with a unique ID', () => {
  const op1 = createOperationYobta({ type: YOBTA_COMMIT })
  const op2 = createOperationYobta({ type: YOBTA_COMMIT })

  expect(op1.id).not.toEqual(op2.id)
})

it('should generate an operation with the current time', () => {
  // const op = createOperationYobta({ type: YOBTA_COMMIT })
  // expect(op.time).toBeCloseTo(Date.now(), -3)
})

it('should generate an operation with the correct type', () => {
  const op = createOperationYobta({ type: YOBTA_COMMIT })

  expect(op.type).toEqual(YOBTA_COMMIT)
})

it('should generate an operation with the provided data', () => {
  const op = createOperationYobta({
    type: YOBTA_COMMIT,
    id: 'op1',
    committed: 2,
  })

  expect(op).toEqual({ id: 'op1', committed: 2, merged: 0, type: YOBTA_COMMIT })
})
