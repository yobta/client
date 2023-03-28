import { Clock, Cross, Toast } from '@yobta/ui'

import { popNotification, useNotification } from '../notificationStore'

export const NotificationToast = (): JSX.Element => {
  const notification = useNotification()

  return (
    <Toast
      className="yobta-info pr-2 w-screen max-w-sm items-start"
      hideAfterSeconds={6}
      onClose={popNotification}
      placement="bottom-right"
      visible={!!notification}
    >
      {({ close, countdown }) => (
        <>
          <div className="flex-1">
            <p className="mb-2 line-clamp-2">{notification?.message}</p>
            <div className="yobta-badge -ml-2">
              <Clock className="w-3 h-3" />
              {countdown}
            </div>
          </div>
          <button
            className="yobta-button rounded-full w-12 h-12 p-0"
            type="button"
            onClick={close}
          >
            <Cross className="w-full" />
          </button>
        </>
      )}
    </Toast>
  )
}
