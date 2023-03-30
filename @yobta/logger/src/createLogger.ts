/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPubSub, YobtaPubsubSubscriber } from '@yobta/stores'

interface YobtaLoggerFactory {
  (): YobtaLogger
}
export type YobtaLogger = YobtaAnyLogger & {
  subscribe: <Topic extends keyof BaseTopics>(
    topic: Topic,
    subscriber: YobtaPubsubSubscriber<BaseTopics[Topic]>,
  ) => VoidFunction
}
export type YobtaAnyLogger = {
  debug: (...args: any[]) => void
  error: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
}
type BaseTopics = {
  [K in keyof YobtaAnyLogger]: Parameters<YobtaAnyLogger[K]>
}

export const createLogger: YobtaLoggerFactory = () => {
  const { publish, subscribe } = createPubSub<BaseTopics>()
  const info: YobtaAnyLogger['info'] = (...args) => {
    publish('info', ...args)
  }
  const warn: YobtaAnyLogger['warn'] = (...args) => {
    publish('warn', ...args)
  }
  const error: YobtaAnyLogger['error'] = (...args) => {
    publish('error', ...args)
  }
  const debug: YobtaAnyLogger['debug'] = (...args) => {
    publish('debug', ...args)
  }
  return {
    debug,
    error,
    info,
    subscribe,
    warn,
  }
}
