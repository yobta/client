import {
  YobtaError,
  YobtaClientOperation,
  YOBTA_ERROR,
  YobtaRemoteOperation,
} from '@yobta/protocol'

import { createOperationYobta } from '../createOperation/createOperation.js'

interface EncoderFactory {
  (): {
    encode: (params: {
      headers?: Record<string, string>
      operation: YobtaClientOperation
    }) => string
    decode: (value: string) => YobtaRemoteOperation
  }
}

export type YobtaClientEncoder = ReturnType<EncoderFactory>

export const encoderYobta: EncoderFactory = () => {
  return {
    encode(value) {
      return JSON.stringify(value)
    },
    decode(value) {
      try {
        return JSON.parse(value)
      } catch (_) {
        let error = createOperationYobta<YobtaError>({
          type: YOBTA_ERROR,
          message: String(value),
        })
        return error
      }
    },
  }
}
