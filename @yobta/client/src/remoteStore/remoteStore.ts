import { broadcastChannelPlugin, createStore } from '@yobta/stores'
import {
  YobtaCollectionAnySnapshot,
  YobtaRemoteOperation,
} from '@yobta/protocol'

export const remoteStore = createStore<
  YobtaRemoteOperation<YobtaCollectionAnySnapshot>
>(
  {} as YobtaRemoteOperation<YobtaCollectionAnySnapshot>,
  broadcastChannelPlugin({
    channel: 'yobta-remote-op',
  }),
)
