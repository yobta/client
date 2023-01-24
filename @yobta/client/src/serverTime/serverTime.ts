import { storeYobta } from '@yobta/stores'

export const serverTimeCompensator = storeYobta(0)

export const compensateTimeDifference = (
  clientTime: number,
  serverTime: number,
): void => {
  let latency = (Date.now() - clientTime) * 0.5
  let localTimeOfServerResponse = clientTime + latency
  serverTimeCompensator.next(localTimeOfServerResponse - serverTime)
}

export const getServerTime = (): number => {
  return Date.now() + serverTimeCompensator.last()
}
