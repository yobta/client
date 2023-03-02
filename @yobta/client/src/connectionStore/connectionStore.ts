import { localStoragePlugin, createStore } from '@yobta/stores'

// #region types
export type YOBTA_CONNECTION_STATE =
  | typeof YOBTA_CONNECTING
  | typeof YOBTA_OPEN
  | typeof YOBTA_CLOSING
  | typeof YOBTA_CLOSED
  | typeof YOBTA_CONNECTION_ERROR
  | typeof YOBTA_CONNECTION_OFFLINE

export const YOBTA_CONNECTING = 'CONNECTING'
export const YOBTA_OPEN = 'OPEN'
export const YOBTA_CLOSING = 'CLOSING'
export const YOBTA_CLOSED = 'CLOSED'
export const YOBTA_CONNECTION_ERROR = 'ERROR'
export const YOBTA_CONNECTION_OFFLINE = 'OFFLINE'
// #endregion

export const connectionStore = createStore<YOBTA_CONNECTION_STATE>(
  YOBTA_CLOSED,
  localStoragePlugin({
    channel: 'yobta-client-state',
  }),
)
