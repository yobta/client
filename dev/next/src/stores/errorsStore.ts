import { createStore } from '@yobta/stores'
import { useStore } from '@yobta/stores/react'
import { YobtaErrorReporter } from '@yobta/validator'

export interface ErrorLike {
  name: string
  message: string
  type?: string
}

const errorsStore = createStore<ErrorLike[]>([])

export const pushError = (error: ErrorLike): void => {
  const last = errorsStore.last()
  const state = last.some((left) => left.message === error.message)
    ? last
    : [...last, error]
  errorsStore.next(state)
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
  const errors = useStore(errorsStore, { getServerSnapshot: () => [] })
  return [errors[0], errors.length]
}
