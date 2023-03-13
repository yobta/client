interface YobtaServerParseUnknownError {
  (error: unknown): Error
}

export const parseUnknownError: YobtaServerParseUnknownError = error => {
  if (error instanceof Error) {
    return error
  }
  return new Error(String(error))
}
