import { clientYobta, websocketYobta } from '@yobta/client'
import { createConnectivityStore } from '@yobta/stores'
import { useEffect } from 'react'

const transport = websocketYobta({ url: 'ws://localhost:8080/' })
const internetObserver = createConnectivityStore()

const connect = clientYobta({
  transport,
  internetObserver,
})

export const useClient = (): void => {
  useEffect(connect, [])
}
