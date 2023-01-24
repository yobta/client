import { localStoragePluginYobta, storeYobta } from '@yobta/stores'

// #region types
export type YOBTA_CONNECTION_STATE =
  | typeof YOBTA_CONNECTING
  | typeof YOBTA_OPEN
  | typeof YOBTA_CLOSING
  | typeof YOBTA_CLOSED
  | typeof YOBTA_CONNECTION_ERROR

export const YOBTA_CONNECTING = 'CONNECTING'
export const YOBTA_OPEN = 'OPEN'
export const YOBTA_CLOSING = 'CLOSING'
export const YOBTA_CLOSED = 'CLOSED'
export const YOBTA_CONNECTION_ERROR = 'ERROR'
// #endregion

export const connectionStore = storeYobta<YOBTA_CONNECTION_STATE>(
  YOBTA_CLOSED,
  localStoragePluginYobta({
    channel: 'yobta-client-state',
  }),
)
