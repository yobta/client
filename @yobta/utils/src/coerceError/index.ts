interface YobtaCoerceError {
  (error: unknown): Error
}

export const coerceError: YobtaCoerceError = error => {
  if (error instanceof Error) {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message))
  }
  return new Error(String(error ?? 'Unknown error'))
}
