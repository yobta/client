import get from 'lodash/get'

interface ParseUnknownError {
  (unknownError: unknown): Error
}

const falbackMessage = 'Unknown error'

export const parseUnknownError: ParseUnknownError = (unknownError) => {
  const message: unknown = get(unknownError, 'message', unknownError)
  if (unknownError instanceof Error) {
    return unknownError
  } else if (typeof message === 'string' && message.length) {
    return new Error(message)
  }
  return new Error(falbackMessage)
}
