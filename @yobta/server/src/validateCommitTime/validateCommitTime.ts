interface YobtaValidateCommitTime {
  (commitTime: number): number
}

export const validateCommitTime: YobtaValidateCommitTime = commitTime => {
  const maxNumber = Date.now()
  const anyNumber = Number(commitTime) || 0
  const positiveNumber = Math.abs(anyNumber)
  return Math.min(positiveNumber, maxNumber)
}
