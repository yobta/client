import { broadcastChannelPlugin, createStore } from '@yobta/stores'
import { YobtaRemoteOperation } from '@yobta/protocol'

export const remoteStore = createStore<YobtaRemoteOperation>(
  {} as YobtaRemoteOperation,
  broadcastChannelPlugin({
    channel: 'yobta-remote-op',
  }),
)
