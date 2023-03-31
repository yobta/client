import { storeEffect, createStore } from '@yobta/stores'
import { createTimeoutManager, createIntervalManager } from '@yobta/utils'

const PING = 'PING'
const PONG = 'PONG'
const HONK = 'HONK'

let channel: BroadcastChannel | null = null
const interval = createIntervalManager()
const timeout = createTimeoutManager()

const post = (message: string): void => {
  channel?.postMessage(message)
}

const setMain = (): void => {
  mainStore.next(true)
  post(PONG)
}
const ping = (): void => {
  if (!isMainTab()) {
    post(PING)
    timeout.start(setMain, 64)
  }
}
const pong: VoidFunction = () => {
  if (isMainTab()) {
    post(PONG)
  }
}
const honk: VoidFunction = () => {
  post(HONK)
}

export const mainStore = createStore(false)

storeEffect(mainStore, () => {
  channel = new BroadcastChannel('yobta-main-tab')
  channel.onmessage = ({ data }: MessageEvent<string>): void => {
    switch (data) {
      case PING:
        pong()
        break
      case PONG:
        if (isMainTab()) {
          mainStore.next(false)
        }
        timeout.stop(setMain)
        break
      default:
        ping()
        break
    }
  }
  ping()
  interval.start(ping, 1000 * 3)
  window.addEventListener('beforeunload', honk)
  return () => {
    interval.stopAll()
    timeout.stopAll()
    channel?.close()
    channel = null
    window.removeEventListener('beforeunload', honk)
  }
})

export const isMainTab = (): boolean => {
  const isMain = mainStore.last()
  return isMain
}
