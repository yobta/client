import { createIntervalManager, YobtaItervalCallBack } from './index.js'

let intervalManager: any

beforeEach(() => {
  intervalManager = createIntervalManager()
})

describe('createIntervalManager', () => {
  it('should return an object with start, stop, and stopAll methods', () => {
    expect(intervalManager).toEqual(
      expect.objectContaining({
        start: expect.any(Function),
        stop: expect.any(Function),
        stopAll: expect.any(Function),
      }),
    )
  })
})

describe('start', () => {
  let callback: YobtaItervalCallBack

  beforeEach(() => {
    callback = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throw an error if callback is not a function', () => {
    expect(() => intervalManager.start(null, 100)).toThrow(
      'callback is not a function',
    )
  })

  it('should not start the same callback multiple times', () => {
    intervalManager.start(callback, 100)
    intervalManager.start(callback, 100)

    vi.advanceTimersByTime(200)

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should execute the callback at the specified interval', () => {
    intervalManager.start(callback, 100)

    vi.advanceTimersByTime(99)
    expect(callback).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(callback).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should pass overloads to the callback', () => {
    const arg1 = 'arg1'
    const arg2 = 42

    intervalManager.start(callback, 100, arg1, arg2)

    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledWith(arg1, arg2)
  })
})

describe('stop', () => {
  let callback: YobtaItervalCallBack

  beforeEach(() => {
    callback = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should cancel a running interval', () => {
    intervalManager.start(callback, 100)
    intervalManager.stop(callback)

    vi.advanceTimersByTime(200)
    expect(callback).not.toHaveBeenCalled()
  })

  it('should not throw an error if the callback is not in the heap', () => {
    expect(() => intervalManager.stop(callback)).not.toThrow()
  })
})

describe('stopAll', () => {
  let callback1: YobtaItervalCallBack
  let callback2: YobtaItervalCallBack

  beforeEach(() => {
    callback1 = vi.fn()
    callback2 = vi.fn()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should cancel all running intervals', () => {
    intervalManager.start(callback1, 100)
    intervalManager.start(callback2, 200)
    intervalManager.stopAll()

    vi.advanceTimersByTime(200)
    expect(callback1).not.toHaveBeenCalled()
    expect(callback2).not.toHaveBeenCalled()
  })

  it('should not throw an error if there are no running intervals', () => {
    expect(() => intervalManager.stopAll()).not.toThrow()
  })
})
