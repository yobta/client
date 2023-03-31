type AnyOverloads = any[] // eslint-disable-line @typescript-eslint/no-explicit-any

export type YobtaItervalCallBack<Args extends AnyOverloads = AnyOverloads> = (
  ...args: Args
) => void

interface YobtaIntervalFactory {
  (): {
    start: <Args extends AnyOverloads>(
      callback: YobtaItervalCallBack<Args>,
      timeout: number,
      ...overloads: Args
    ) => void
    stop(callback: YobtaItervalCallBack): void
    stopAll: VoidFunction
  }
}

export const createIntervalManager: YobtaIntervalFactory = () => {
  const heap = new Map<YobtaItervalCallBack, NodeJS.Timeout>()
  const stop = (callback: YobtaItervalCallBack): void => {
    clearInterval(heap.get(callback))
    heap.delete(callback)
  }
  return {
    start(callback, timeout, ...overloads) {
      if (typeof callback !== 'function') {
        throw new Error('callback is not a function')
      }
      if (!heap.has(callback as YobtaItervalCallBack)) {
        const timeoutId = setInterval(callback, timeout, ...overloads)
        heap.set(callback as YobtaItervalCallBack, timeoutId)
      }
    },
    stop,
    stopAll() {
      heap.forEach((_, callback) => {
        stop(callback)
      })
    },
  }
}
