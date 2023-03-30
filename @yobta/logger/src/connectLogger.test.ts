import { createLogger } from './createLogger.js'
import { connectLogger } from './connectLogger.js'

describe('Connect Logger', () => {
  let yobtaLogger: any
  let partialLogger: any
  beforeEach(() => {
    yobtaLogger = createLogger()
    partialLogger = {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      unsupported: vi.fn(),
    }
  })
  it('should subscribe partial methods to yobtaLogger', () => {
    connectLogger(yobtaLogger, partialLogger)
    const message = 'Testing'
    yobtaLogger.debug(message)
    expect(partialLogger.debug).toHaveBeenCalledTimes(1)
    expect(partialLogger.debug).toHaveBeenCalledWith(message)
  })
  it('should not subscribe unsupported methods to yobtaLogger', () => {
    const mockLogger: any = {
      debug: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      subscribe: vi.fn(),
    }
    connectLogger(mockLogger, partialLogger)
    expect(mockLogger.subscribe.mock.calls).toEqual([
      ['debug', expect.any(Function)],
      ['error', expect.any(Function)],
      ['info', expect.any(Function)],
      ['warn', expect.any(Function)],
    ])
  })
  it('should throw an error if the logger method is not a function', () => {
    const invalidPartialLogger: any = {
      debug: 'invalid',
    }
    expect(() => connectLogger(yobtaLogger, invalidPartialLogger)).toThrow(
      'Logger method must be a function',
    )
  })
  it('should return an unsubscribe function', () => {
    const unsubscribe = connectLogger(yobtaLogger, partialLogger)
    expect(typeof unsubscribe).toBe('function')
  })
  it('should unsubscribe partial methods from yobtaLogger', () => {
    const unsubscribe = connectLogger(yobtaLogger, partialLogger)
    const message = 'Testing'
    yobtaLogger.debug(message)
    unsubscribe()
    yobtaLogger.debug(message)
    expect(partialLogger.debug).toHaveBeenCalledTimes(1)
  })
})
