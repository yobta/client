interface YobtaNormalizePath {
  (input: string): string
}

export const normalizePath: YobtaNormalizePath = input =>
  input.trim().replace(/[/\s]+$/g, '') || '/'
