import {
  YobtaCommit,
  YobtaReject,
  YOBTA_COMMIT,
  YOBTA_REJECT,
} from '../protocol/protocol.js'
import {
  notifyOperationObservers,
  operationResult,
  operationResultObservers,
} from './operationResult.js'

beforeEach(() => {
  operationResultObservers.clear()
})

it('should call all registered observers with the operation argument', () => {
  let observer1 = vi.fn()
  let observer2 = vi.fn()
  let mockOperation: YobtaCommit = {
    id: 'operation-2',
    channel: 'channel-1',
    time: 123456789,
    ref: 'operation-1',
    type: YOBTA_COMMIT,
  }

  operationResultObservers.add(observer1)
  operationResultObservers.add(observer2)
  notifyOperationObservers(mockOperation)
  expect(observer1).toBeCalledWith(mockOperation)
  expect(observer2).toBeCalledWith(mockOperation)
  expect(operationResultObservers.size).toBe(2)
})

it('should resolve if the operation is committed and remove observer', () => {
  let mockOperation: YobtaCommit = {
    id: 'operation-2',
    channel: 'channel-1',
    time: 123456789,
    ref: 'operation-1',
    type: YOBTA_COMMIT,
  }
  let promise = operationResult('operation-1')

  notifyOperationObservers(mockOperation)
  expect(promise).resolves.toBeUndefined()
  expect(operationResultObservers.size).toBe(0)
})

it('should reject if the operation is rejected and remove observer', () => {
  let mockOperation: YobtaReject = {
    id: 'operation-2',
    channel: 'channel-1',
    ref: 'operation-1',
    time: 123456789,
    type: YOBTA_REJECT,
    reason: 'Operation was rejected',
  }

  let promise = operationResult('operation-1')
  expect(operationResultObservers.size).toBe(1)

  notifyOperationObservers(mockOperation)
  expect(promise).rejects.toThrowError('Operation was rejected')
  expect(operationResultObservers.size).toBe(0)
})

it('should not resolve if the operation is committed but for another operation', () => {
  let mockOperation: YobtaCommit = {
    id: 'operation-2',
    channel: 'channel-1',
    time: 123456789,
    ref: 'operation-2',
    type: YOBTA_COMMIT,
  }
  let promise = operationResult('operation-1')

  notifyOperationObservers(mockOperation)
  expect(promise).resolves.toBeUndefined()
  expect(operationResultObservers.size).toBe(1)
})
