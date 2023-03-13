import {
  YobtaError,
  YOBTA_ERROR,
  YobtaRemoteOperation,
  YobtaCollectionAnySnapshot,
  YobtaClientMessage,
} from '@yobta/protocol'

import { createOperation } from '../createOperation/createOperation.js'

interface YobtaEncoderFactory {
  (): {
    encode: (params: YobtaClientMessage) => string
    decode: (value: string) => YobtaRemoteOperation<YobtaCollectionAnySnapshot>
  }
}

export type YobtaClientEncoder = ReturnType<YobtaEncoderFactory>

export const encoderYobta: YobtaEncoderFactory = () => {
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
