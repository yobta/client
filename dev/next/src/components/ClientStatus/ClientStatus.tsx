import { connectionStore, mainStore } from '@yobta/client'
import { useStore } from '@yobta/stores/react'

interface ClientStatusFC {
  (): JSX.Element
}

export const ClientStatus: ClientStatusFC = () => {
  const state = useStore(connectionStore)
  const isMain = useStore(mainStore)
  return (
    <>
      <p>Connection State: {state}</p>
      <p>Is master: {String(isMain)}</p>
    </>
  )
}
