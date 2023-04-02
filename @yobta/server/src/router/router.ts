import { YobtaClientMessage } from '@yobta/protocol'
import { createRouter, YobtaRouterCallback } from '@yobta/utils'

import { ServerCallbacks } from '../createServer/createServer.js'
import { serverLogger } from '../serverLogger/serverLogger.js'

const router = createRouter()

export const onClientMessage = <
  Path extends string,
  Overloads extends [YobtaClientMessage, ServerCallbacks],
>(
  path: Path,
  callback: YobtaRouterCallback<Path, Overloads>,
): VoidFunction => router.subscribe<Path, Overloads>(path, callback)

export const broadcastClientMessage = (
  channel: string,
  { clientId, headers, operation }: YobtaClientMessage,
  callbacks: ServerCallbacks,
): void => {
  try {
    router.publish<[YobtaClientMessage, ServerCallbacks]>(
      channel,
      { clientId, headers, operation },
      callbacks,
    )
    serverLogger.debug({ clientId, channel, operation, headers })
  } catch (error) {
    serverLogger.error({ channel, operation, headers, error })
    callbacks.reject(operation, 'Channel not found')
  }
}
