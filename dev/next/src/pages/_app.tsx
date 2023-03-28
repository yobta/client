import type { AppProps } from 'next/app'

import { ConnectionToast } from '../components/Notification/ConnectionToast'
import { ErrorBoundary } from '../components/Error/ErrorBoundary'
import { ErrorToast } from '../components/Error/ErrorToast'
import { NotificationToast } from '../components/Notification/NotificationToast'
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
