import { Clock, Cross, Toast } from '@yobta/ui'

import { useError, popError } from '../../../stores/errorsStore'

export const ErrorToast = (): JSX.Element => {
  const [error] = useError()

  return (
    <>
      <Toast
        className="yobta-error pr-2 w-screen max-w-sm items-start"
        hideAfterSeconds={16}
        onClose={popError}
        placement="bottom-left"
        visible={!!error}
      >
        {({ close, countdown }) => (
          <>
            <div>
              <h6 className="text-sm font-semibold">{error?.name}</h6>
              <p className="mb-2 line-clamp-2">{error?.message}</p>
              <div className="yobta-badge -ml-2">
                <Clock className="w-3 h-3" />
                {countdown}
              </div>
            </div>
            <button
              type="button"
              className="yobta-button w-12 h-12 p-0 rounded-full shrink-0"
              onClick={close}
            >
              <Cross />
            </button>
          </>
        )}
      </Toast>
    </>
  )
}
