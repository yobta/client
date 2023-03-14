import { broadcastChannelPlugin, createStore } from '@yobta/stores'
import {
  YobtaCollectionAnySnapshot,
  YobtaServerOperation,
} from '@yobta/protocol'

export const remoteStore = createStore<
  YobtaServerOperation<YobtaCollectionAnySnapshot>
>(
  {} as YobtaServerOperation<YobtaCollectionAnySnapshot>,
  broadcastChannelPlugin({
    channel: 'yobta-remote-op',
  }),
)
