interface CallBack {
  (...args: any[]): void
}

interface IntervalFactory {
  (): {
    start(callback: CallBack, timeout: number, ...overloads: any[]): void
    stop(callback: CallBack): void
    stopAll: VoidFunction
  }
}

export const intervalYobta: IntervalFactory = () => {
  const heap = new Map<VoidFunction, NodeJS.Timeout>()
  const stop = (callback: VoidFunction): void => {
    clearInterval(heap.get(callback))
    heap.delete(callback)
  }
  return {
    start(callback, timeout, ...overloads) {
      if (!heap.has(callback)) {
        const timeoutId = setInterval(callback, timeout, ...overloads)
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
