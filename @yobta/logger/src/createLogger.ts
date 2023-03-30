/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPubSub, YobtaPubsubSubscriber } from '@yobta/stores'

interface YobtaLoggerFactory {
  (options?: { callerInfo?: boolean }): YobtaLogger
}
export type YobtaLogger = YobtaAnyLogger & {
  subscribe: <Topic extends keyof BaseTopics>(
    topic: Topic,
    subscriber: YobtaPubsubSubscriber<BaseTopics[Topic]>,
  ) => VoidFunction
}
export type YobtaLogMethod = (...args: any[]) => void
export type YobtaAnyLogger = {
  debug: YobtaLogMethod
  error: YobtaLogMethod
  info: YobtaLogMethod
  warn: YobtaLogMethod
}
type BaseTopics = {
  [K in keyof YobtaAnyLogger]: Parameters<YobtaAnyLogger[K]>
}

function getCallerInfo(): string {
  return String(new Error().stack?.split('\n')[3].trim())
}

export const createLogger: YobtaLoggerFactory = ({ callerInfo } = {}) => {
  const { publish, subscribe } = createPubSub<BaseTopics>()
  const createMethod =
    (topic: keyof BaseTopics): YobtaLogMethod =>
    (...args) => {
      const argsWithCallerInfo = callerInfo ? [...args, getCallerInfo()] : args
      publish(topic, ...argsWithCallerInfo)
    }
  return {
    debug: createMethod('debug'),
    error: createMethod('error'),
    info: createMethod('info'),
    warn: createMethod('warn'),
    subscribe,
  }
}
