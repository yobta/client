import { createClient, createWsTransport } from '@yobta/client'
import { createConnectivityStore } from '@yobta/stores'
import { useEffect } from 'react'

const transport = createWsTransport({ url: 'ws://localhost:8080/' })
const internetObserver = createConnectivityStore()

const connect = createClient({
  logger: console,
  internetObserver,
  getHeaders() {
    return {}
  },
  transport,
})

export const useClient = (): void => {
  useEffect(connect, [])
}
