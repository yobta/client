import type { AppProps } from 'next/app'

import { ConnectionToast } from '../components/Toast/ConnectionToast'
import { ErrorBoundary } from '../components/Error/ErrorBoundary'
import { ErrorToast } from '../components/Toast/ErrorToast'
import { NotificationToast } from '../components/Toast/NotificationToast'
import '../styles/globals.css'
import { useClient } from '../hooks/useClient'
import { ClientStatus } from '../components/ClientStatus/ClientStatus'

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useClient()
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
      <ErrorToast />
      <NotificationToast />
      <ConnectionToast />
      <ClientStatus />
    </ErrorBoundary>
  )
}

export default MyApp
