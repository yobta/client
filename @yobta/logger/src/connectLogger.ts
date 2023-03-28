import { YobtaAnyLogger, YobtaLogger } from './createLogger.js'

interface ConnectLogger {
  (yobtaLogger: YobtaLogger, anyLogger: Partial<YobtaAnyLogger>): VoidFunction
}

export const connectLogger: ConnectLogger = (yobtaLogger, partialLogger) => {
  const unsubscribers = Object.entries(partialLogger).reduce<VoidFunction[]>(
    (acc, [method, fn]) => {
      if (method in yobtaLogger && method !== 'subscribe') {
        if (typeof fn !== 'function') {
          throw new Error('Logger method must be a function')
        }
        acc.push(yobtaLogger.subscribe(method as keyof YobtaAnyLogger, fn))
      }
      return acc
    },
    [],
  )
  return () => {
    unsubscribers.forEach(unsubscribe => {
      unsubscribe()
    })
  }
}
