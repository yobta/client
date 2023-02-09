import { clientYobta, websocketYobta } from '@yobta/client'
import { onlineYobta } from '@yobta/stores'
import { useEffect } from 'react'

const transport = websocketYobta({ url: 'ws://localhost:8080/' })
const internetObserver = onlineYobta()

const connect = clientYobta({
  transport,
  internetObserver,
})

export const useClient = (): void => {
  useEffect(connect, [])
}
