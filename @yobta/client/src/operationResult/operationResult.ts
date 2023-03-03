import {
  YobtaMergeOperation,
  YobtaOperationId,
  YobtaRejectOperation,
  YOBTA_MERGE,
  YOBTA_REJECT,
} from '@yobta/protocol'

interface OperationResultPromiseFactory {
  (operationId: YobtaOperationId): Promise<void>
}

type Observer = (operation: YobtaMergeOperation | YobtaRejectOperation) => void

export const operationResultObservers = new Set<Observer>()

export const notifyOperationObservers = (
  operation: YobtaMergeOperation | YobtaRejectOperation,
): void => {
  operationResultObservers.forEach(observer => {
    observer(operation)
  })
}

export const operationResult: OperationResultPromiseFactory = operationId =>
  new Promise((resolve, reject) => {
    const ovserver: Observer = operation => {
      if (operation.operationId !== operationId) return
      if (operation.type === YOBTA_MERGE) resolve()
      if (operation.type === YOBTA_REJECT) reject(new Error(operation.reason))
      operationResultObservers.delete(ovserver)
    }
    operationResultObservers.add(ovserver)
  })
