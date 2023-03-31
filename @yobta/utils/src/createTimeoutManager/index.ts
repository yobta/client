type AnyOverloads = any[] // eslint-disable-line @typescript-eslint/no-explicit-any

export type YobtaTimeoutCallBack<Args extends AnyOverloads = AnyOverloads> = (
  ...args: Args
) => void

interface TimeoutFactory {
  (): {
    start: <Args extends AnyOverloads>(
      callback: YobtaTimeoutCallBack<Args>,
      timeout: number,
      ...overloads: Args
    ) => void
    stop(callback: YobtaTimeoutCallBack): void
    stopAll: VoidFunction
  }
}

export const createTimeoutManager: TimeoutFactory = () => {
  const heap = new Map<YobtaTimeoutCallBack, NodeJS.Timeout>()
  const stop = (callback: YobtaTimeoutCallBack): void => {
    clearTimeout(heap.get(callback))
    heap.delete(callback)
  }
  return {
    start(callback, timeout, ...overloads) {
      if (typeof callback !== 'function') {
        throw new Error('callback is not a function')
      }
      if (!heap.has(callback as YobtaTimeoutCallBack)) {
        const timeoutId = setTimeout(() => {
          callback(...overloads)
          stop(callback as YobtaTimeoutCallBack)
        }, timeout)
        heap.set(callback as YobtaTimeoutCallBack, timeoutId)
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
