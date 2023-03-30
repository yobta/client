interface YobtaCoerceError {
  (error: unknown): Error
}

const nonNullish = (value: unknown): string => String(value ?? 'Unknown error')

class ExtendedError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor({ message, ...rest }: any) {
    const messageString = nonNullish(
      typeof message === 'object' && message !== null ? null : message,
    )
    super(messageString)
    Object.assign(this, rest, { originalMessage: message })
  }
}

export const coerceError: YobtaCoerceError = error => {
  if (error instanceof Error) return error
  if (typeof error === 'object' && error !== null) {
    return new ExtendedError(error)
  }
  return new Error(nonNullish(error))
}
