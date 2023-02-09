import { storeYobta } from '@yobta/stores'
import { useYobta } from '@yobta/stores/react'
import { YobtaErrorReporter } from '@yobta/validator'

export interface ErrorLike {
  name: string
  message: string
  type?: string
}

const errorsStore = storeYobta<ErrorLike[]>([])

export const pushError = (error: ErrorLike): void => {
  const last = errorsStore.last()
  const state = last.some((left) => left.message === error.message)
    ? last
    : [...last, error]
  errorsStore.next(state as ErrorLike[])
}

export const popError = (): void => {
  const [, ...state] = errorsStore.last()
  errorsStore.next(state)
}

export const omitYobtaErrors = (): void => {
  const state = errorsStore.last().filter(({ type }) => type !== 'YobtaError')
  errorsStore.next(state)
}

export const handleYobtaErrors: YobtaErrorReporter = (errors, { event }) => {
  if (event?.type !== 'submit') {
    return
  }
  const rootLevelErrors = errors.filter(({ field }) => field === '@')
  if (rootLevelErrors.length < errors.length) {
    pushError({
      name: 'Error!',
      message: 'Need to fill out a form',
      type: 'YobtaError',
    })
  }
  if (rootLevelErrors.length) {
    rootLevelErrors.forEach(pushError)
  }
}

export const useError = (): [ErrorLike | undefined, number] => {
  const errors = useYobta(errorsStore)
  return [errors[0], errors.length]
}
