import { createTimeoutManager, YobtaTimeoutCallBack } from './index.js'

let timeoutManager: any

beforeEach(() => {
  timeoutManager = createTimeoutManager()
})
describe('createTimeoutManager', () => {
  it('should return an object with start, stop, and stopAll methods', () => {
    expect(timeoutManager).toEqual(
      expect.objectContaining({
        start: expect.any(Function),
        stop: expect.any(Function),
        stopAll: expect.any(Function),
      }),
    )
  })
})

describe('start', () => {
  let callback: YobtaTimeoutCallBack

  beforeEach(() => {
    callback = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throw an error if callback is not a function', () => {
    expect(() => timeoutManager.start(null, 100)).toThrow(
      'callback is not a function',
    )
  })

  it('should not start the same callback multiple times', () => {
    timeoutManager.start(callback, 100)
    timeoutManager.start(callback, 100)

    vi.advanceTimersByTime(100)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should execute the callback after the specified timeout', () => {
    timeoutManager.start(callback, 100)
    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalled()
    it('should execute the callback after the specified timeout', () => {
      timeoutManager.start(callback, 100)

      vi.advanceTimersByTime(99)
      expect(callback).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      expect(callback).toHaveBeenCalled()
    })

    it('should pass overloads to the callback', () => {
      const arg1 = 'arg1'
      const arg2 = 42

      timeoutManager.start(callback, 100, arg1, arg2)

      vi.advanceTimersByTime(100)
      expect(callback).toHaveBeenCalledWith(arg1, arg2)
    })
  })
})
describe('stop', () => {
  let callback: YobtaTimeoutCallBack

  beforeEach(() => {
    callback = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should cancel a running timeout', () => {
    timeoutManager.start(callback, 100)
    timeoutManager.stop(callback)

    vi.advanceTimersByTime(100)
    expect(callback).not.toHaveBeenCalled()
  })

  it('should not throw an error if the callback is not in the heap', () => {
    expect(() => timeoutManager.stop(callback)).not.toThrow()
  })
})

describe('stopAll', () => {
  let callback1: YobtaTimeoutCallBack
  let callback2: YobtaTimeoutCallBack

  beforeEach(() => {
    callback1 = vi.fn()
    callback2 = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should cancel all running timeouts', () => {
    timeoutManager.start(callback1, 100)
    timeoutManager.start(callback2, 200)
    timeoutManager.stopAll()

    vi.advanceTimersByTime(200)
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
  })

  it('should not throw an error if there are no running timeouts', () => {
    expect(() => timeoutManager.stopAll()).not.toThrow()
  })
})
