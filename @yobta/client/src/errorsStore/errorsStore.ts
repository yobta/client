import { createMapStore } from '@yobta/stores'
import { YobtaError } from '@yobta/protocol'

export const yobtaErrorsStore = createMapStore<YobtaError>({} as YobtaError)

export const createErrorYobta = (error: YobtaError): void => {
  yobtaErrorsStore.assign({ [error.message]: error })
}

export const removeYobtaError = (error: YobtaError): void => {
  yobtaErrorsStore.omit([error.message] as never[])
}
