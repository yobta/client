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
    <div className="text-xs mx-4 opacity-60">
      <p>Connection State: {state}</p>
      <p>Is master tab: {String(isMain)}</p>
    </div>
  )
}
