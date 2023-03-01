import {
  YobtaError,
  YobtaClientOperation,
  YOBTA_ERROR,
  YobtaRemoteOperation,
} from '@yobta/protocol'

import { createOperation } from '../createOperation/createOperation.js'

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
        const error = createOperation<YobtaError>({
          type: YOBTA_ERROR,
          message: String(value),
        })
        return error
      }
    },
  }
}
