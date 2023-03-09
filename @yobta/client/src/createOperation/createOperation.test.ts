import { YOBTA_REJECT } from '@yobta/protocol'

import { createOperation } from './createOperation.js'

it('should generate an operation with a unique ID', () => {
  const op1 = createOperation({ type: YOBTA_REJECT })
  const op2 = createOperation({ type: YOBTA_REJECT })

  expect(op1.id).not.toEqual(op2.id)
})

// it('should generate an operation with the current time', () => {
//   const op = createOperationYobta({ type: YOBTA_COMMIT })
//   expect(op.time).toBeCloseTo(Date.now(), -3)
// })

it('should generate an operation with the correct type', () => {
  const op = createOperation({ type: YOBTA_REJECT })
  expect(op.type).toEqual(YOBTA_REJECT)
})

it('should generate an operation with the provided data', () => {
  const op = createOperation({
    type: YOBTA_REJECT,
    id: 'op1',
    committed: 2,
  })
  expect(op).toEqual({ id: 'op1', committed: 2, merged: 0, type: YOBTA_REJECT })
})
