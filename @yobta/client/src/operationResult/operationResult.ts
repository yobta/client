import {
  YobtaCollectionAnySnapshot,
  YOBTA_REJECT,
  YobtaServerOperation,
  YobtaClientDataOperation,
} from '@yobta/protocol'

type Observer = (
  operation: YobtaServerOperation<YobtaCollectionAnySnapshot>,
) => void

export const operationResultObservers = new Set<Observer>()

export const notifyOperationObservers = (
  operation: YobtaServerOperation<YobtaCollectionAnySnapshot>,
): void => {
  operationResultObservers.forEach(observer => {
    observer(operation)
  })
}

export const operationResult = ({
  id,
}: YobtaClientDataOperation<YobtaCollectionAnySnapshot>): Promise<void> =>
  new Promise((resolve, reject) => {
    const observer: Observer = serverOperation => {
      if (
        serverOperation.type === YOBTA_REJECT &&
        serverOperation.operationId === id
      ) {
        operationResultObservers.delete(observer)
        reject(new Error(serverOperation.reason))
        return
      }
      if (serverOperation.id === id) {
        operationResultObservers.delete(observer)
        resolve()
      }
    }
    operationResultObservers.add(observer)
  })
