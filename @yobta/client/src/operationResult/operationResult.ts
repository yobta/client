import {
  YobtaCollectionAnySnapshot,
  YobtaCollectionInsertOperation,
  YobtaCollectionUpdateOperation,
  YobtaOperationId,
  YobtaRejectOperation,
  YOBTA_COLLECTION_INSERT,
  YOBTA_COLLECTION_UPDATE,
  YOBTA_REJECT,
} from '@yobta/protocol'

interface OperationResultPromiseFactory {
  (operationId: YobtaOperationId): Promise<void>
}

type SupportedOperation =
  | YobtaCollectionInsertOperation<YobtaCollectionAnySnapshot>
  | YobtaCollectionUpdateOperation<YobtaCollectionAnySnapshot>
  | YobtaRejectOperation

type Observer = (operation: SupportedOperation) => void

export const operationResultObservers = new Set<Observer>()

export const notifyOperationObservers = (
  operation: SupportedOperation,
): void => {
  operationResultObservers.forEach(observer => {
    observer(operation)
  })
}

export const operationResult: OperationResultPromiseFactory = operationId =>
  new Promise((resolve, reject) => {
    const ovserver: Observer = operation => {
      switch (operation.type) {
        case YOBTA_COLLECTION_INSERT:
        case YOBTA_COLLECTION_UPDATE: {
          if (operation.id === operationId) {
            resolve()
            operationResultObservers.delete(ovserver)
          }
          break
        }
        case YOBTA_REJECT: {
          if (operation.operationId === operationId) {
            reject(new Error(operation.reason))
            operationResultObservers.delete(ovserver)
          }
          break
        }
      }
    }
    operationResultObservers.add(ovserver)
  })
