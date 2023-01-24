import { broadcastChannelPluginYobta, storeYobta } from '@yobta/stores';
export const remoteStore = storeYobta({}, broadcastChannelPluginYobta({
    channel: 'yobta-remote-op',
}));
