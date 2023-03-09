import { createMapStore } from '@yobta/stores'
import { YobtaError, YobtaRejectOperation } from '@yobta/protocol'

export const yobtaErrorsStore = createMapStore<YobtaError>({} as YobtaError)

export const createErrorYobta = (operation: YobtaRejectOperation): void => {
  yobtaErrorsStore.assign({ [operation.reason]: operation })
}

export const removeYobtaError = (error: YobtaError): void => {
  yobtaErrorsStore.omit([error.message] as never[])
}
