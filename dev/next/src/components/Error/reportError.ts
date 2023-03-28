interface ErrorReporter {
  (error: Error, ...details: unknown[]): void
}

export const reportError: ErrorReporter = (error) => {
  // TODO: report error to server or SASS

  // eslint-disable-next-line no-console
  console.error(error)
}
