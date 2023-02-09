import {
  YobtaCommit,
  YobtaOperationId,
  YobtaReject,
  YOBTA_COMMIT,
  YOBTA_REJECT,
} from '@yobta/protocol'

interface OperationResultPromiseFactory {
  (operationId: YobtaOperationId): Promise<void>
}

type Observer = (operation: YobtaCommit | YobtaReject) => void

export const operationResultObservers = new Set<Observer>()

export const notifyOperationObservers = (
  operation: YobtaCommit | YobtaReject,
): void => {
  operationResultObservers.forEach(observer => {
    observer(operation)
  })
}

export const operationResult: OperationResultPromiseFactory = operationId =>
  new Promise((resolve, reject) => {
    const ovserver: Observer = operation => {
      if (operation.ref !== operationId) return
      if (operation.type === YOBTA_COMMIT) resolve()
      if (operation.type === YOBTA_REJECT) reject(new Error(operation.reason))
      operationResultObservers.delete(ovserver)
    }
    operationResultObservers.add(ovserver)
  })
