import {
  connectionStore,
  mainStore,
  YOBTA_CONNECTION_OFFLINE,
} from '@yobta/client'
import { useStore } from '@yobta/stores/react'

interface ClientStatusFC {
  (): JSX.Element
}

export const ClientStatus: ClientStatusFC = () => {
  const state = useStore(connectionStore, {
    getServerSnapshot: () => YOBTA_CONNECTION_OFFLINE,
  })
  const isMain = useStore(mainStore, { getServerSnapshot: () => false })
  return (
    <>
      <p>Connection State: {state}</p>
      <p>Is master: {String(isMain)}</p>
    </>
  )
}
