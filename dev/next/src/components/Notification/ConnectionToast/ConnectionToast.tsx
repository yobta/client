import { NoConnection, useConnectionStatus } from '@yobta/ui'
import clsx from 'clsx'

interface ConnectionToastFC {
  (): JSX.Element
}

export const ConnectionToast: ConnectionToastFC = () => {
  const { connected, hasChange } = useConnectionStatus()
  return (
    <div
      className={clsx(
        'fixed right-0 top-12 yobta-paper-inversed px-4 py-2 rounded rounded-r-none flex flex-col items-center',
        'z-50 transform-gpu',
        !hasChange && 'hidden',
        connected === false && 'animate-slide-in-right',
        connected === true && 'animate-slide-out-right'
      )}
    >
      <NoConnection />
      <span className="text-sm">No Internet</span>
    </div>
  )
}
