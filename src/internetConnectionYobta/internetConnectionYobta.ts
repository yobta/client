import { ObservableStore, observableYobta } from '@yobta/stores'

interface InternetConnectionFactory {
  (): Omit<ObservableStore<boolean | null>, 'next'>
}

export const internetConnectionYobta: InternetConnectionFactory = () => {
  let supported = typeof window !== 'undefined'
  let { next, ...store } = observableYobta<boolean | null>(
    supported ? navigator.onLine : null,
  )

  if (supported) {
    window.addEventListener('online', () => {
      next(true)
    })
    window.addEventListener('offline', () => {
      next(false)
    })
  }

  return store
}
