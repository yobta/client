import { connectionStore, mainStore } from '@yobta/client'
import { useYobta } from '@yobta/stores/react'

interface ClientStatusFC {
  (): JSX.Element
}

export const ClientStatus: ClientStatusFC = () => {
  const state = useYobta(connectionStore)
  const isMain = useYobta(mainStore)
  return (
    <>
      <p>Connection State: {state}</p>
      <p>Is master: {String(isMain)}</p>
    </>
  )
}
