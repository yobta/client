type AnyOverloads = any[] // eslint-disable-line @typescript-eslint/no-explicit-any

interface CallBack {
  <Args extends AnyOverloads>(...args: Args): void
}

interface TimeoutFactory {
  <Args extends AnyOverloads>(): {
    start(callback: CallBack, timeout: number, ...overloads: Args): void
    stop(callback: CallBack): void
    stopAll: VoidFunction
  }
}

export const timeoutYobta: TimeoutFactory = () => {
  const heap = new Map<VoidFunction, NodeJS.Timeout>()
  const stop = (callback: VoidFunction): void => {
    clearTimeout(heap.get(callback))
    heap.delete(callback)
  }
  return {
    start(callback, timeout, ...overloads) {
      if (!heap.has(callback)) {
        const timeoutId = setTimeout(() => {
          callback(...overloads)
          stop(callback)
        }, timeout)
        heap.set(callback, timeoutId)
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
