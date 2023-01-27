interface GerErrorMessage {
  (error: unknown, fallbackMessage?: string): string
}

export const getErrorMessage: GerErrorMessage = (
  error,
  fallbackMessage,
): string => {
  if (error instanceof Error) {
    return error.message
  } else if (typeof error === 'string') {
    return error
  } else {
    return fallbackMessage || 'Unknown error'
  }
}
