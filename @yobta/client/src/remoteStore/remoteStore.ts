import { broadcastChannelPluginYobta, storeYobta } from '@yobta/stores'
import { YobtaRemoteOperation } from '@yobta/protocol'

export const remoteStore = storeYobta<YobtaRemoteOperation>(
  {} as YobtaRemoteOperation,
  broadcastChannelPluginYobta({
    channel: 'yobta-remote-op',
  }),
)
