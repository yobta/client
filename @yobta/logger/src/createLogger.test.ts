import { createLogger } from './createLogger.js'

describe('Logger Factory', () => {
  let logger: any
  beforeEach(() => {
    logger = createLogger()
  })
  const methods = ['debug', 'error', 'info', 'log', 'warn']
  methods.forEach(method => {
    it(`should have a ${method} method`, () => {
      expect(logger).toHaveProperty(method)
      expect(typeof logger[method]).toBe('function')
    })
    it(`should call subscriber when ${method} is called`, () => {
      const subscriber = vi.fn()
      logger.subscribe(method, subscriber)
      const message = `Testing ${method}`
      logger[method](message)
      expect(subscriber).toHaveBeenCalledTimes(1)
      expect(subscriber).toHaveBeenCalledWith(message)
    })
    it(`should unsubscribe when calling the returned unsubscribe function for ${method}`, () => {
      const subscriber = vi.fn()
      const unsubscribe = logger.subscribe(method, subscriber)
      unsubscribe()
      logger[method]('This message should not be received')
      expect(subscriber).not.toHaveBeenCalled()
    })
  })
  it('should not call other subscribers when a specific method is called', () => {
    const debugSubscriber = vi.fn()
    const errorSubscriber = vi.fn()
    logger.subscribe('debug', debugSubscriber)
    logger.subscribe('error', errorSubscriber)
    logger.debug('Debug message')
    expect(debugSubscriber).toHaveBeenCalledTimes(1)
    expect(debugSubscriber).toHaveBeenCalledWith('Debug message')
    expect(errorSubscriber).not.toHaveBeenCalled()
  })
})
