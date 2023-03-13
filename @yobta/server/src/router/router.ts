import { YobtaClientMessage } from '@yobta/protocol'
import { createRouter, YobtaRouterCallback } from '@yobta/router'

import { ServerCallbacks } from '../createServer/createServer.js'

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
  { headers, operation }: YobtaClientMessage,
  callbacks: ServerCallbacks,
): void => {
  try {
    router.publish<[YobtaClientMessage, ServerCallbacks]>(
      channel,
      { headers, operation },
      callbacks,
    )
  } catch (_e) {
    callbacks.reject(operation, 'Channel not found')
  }
}
