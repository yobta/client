import { createStore } from '@yobta/stores'

export const serverTimeCompensator = createStore(0)

export const compensateTimeDifference = (
  clientTime: number,
  serverTime: number,
): void => {
  const latency = (Date.now() - clientTime) * 0.5
  const localTimeOfServerResponse = clientTime + latency
  serverTimeCompensator.next(localTimeOfServerResponse - serverTime)
}

export const getServerTime = (): number => {
  return Date.now() + serverTimeCompensator.last()
}
