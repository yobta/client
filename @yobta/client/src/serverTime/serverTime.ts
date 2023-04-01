import { YobtaOperationId } from '@yobta/protocol'

let diff = 0

const tracker = new Map<YobtaOperationId, number>()

export const trackClientTime = (operationId: YobtaOperationId): void => {
  tracker.set(operationId, Date.now())
}

export const trackServerTime = (
  operationId: YobtaOperationId,
  serverTime: number,
): boolean => {
  const sentAt = tracker.get(operationId)
  if (!sentAt) {
    return false
  }
  const latency = (Date.now() - sentAt) * 0.5
  const serverNow = sentAt + latency
  diff = serverNow - serverTime
  return tracker.delete(operationId)
}

export const getServerTime = (): number => Date.now() - diff
