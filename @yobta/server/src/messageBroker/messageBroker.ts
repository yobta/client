import {
  YobtaClientMessage,
  YobtaCollectionAnySnapshot,
  YobtaDataOperation,
  YobtaRemoteOperation,
  YobtaSubscribeOperation,
  YobtaUnsubscribeOperation,
} from '@yobta/protocol'
import { createRouter, YobtaRouterCallback } from '@yobta/router'
import { createPubSub } from '@yobta/stores'

import { ServerCallbacks } from '../createServer/createServer.js'

interface ConnectionManager {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    callback: (operation: YobtaRemoteOperation<Snapshot>) => void,
  ): {
    add(operation: YobtaSubscribeOperation): void
    remove(operation: YobtaUnsubscribeOperation): void
    clear(): void
  }
}
interface SendBack {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    operations: YobtaDataOperation<Snapshot>[],
  ): void
}

const incoming = createRouter()

const outgoing = createPubSub<{
  [key: string]: [YobtaRemoteOperation<YobtaCollectionAnySnapshot>]
}>()

export const onClientMessage = <
  Path extends string,
  Overloads extends [YobtaClientMessage, ServerCallbacks],
>(
  path: Path,
  callback: YobtaRouterCallback<Path, Overloads>,
): VoidFunction => incoming.subscribe<Path, Overloads>(path, callback)

export const broadcastClientMessage = (
  channel: string,
  { headers, operation }: YobtaClientMessage,
  callbacks: ServerCallbacks,
): void => {
  try {
    incoming.publish<[YobtaClientMessage, ServerCallbacks]>(
      channel,
      { headers, operation },
      callbacks,
    )
  } catch (_e) {
    callbacks.reject(operation, 'Channel not found')
  }
}

export const registerConnection: ConnectionManager = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  callback: (operation: YobtaRemoteOperation<Snapshot>) => void,
) => {
  let map: Record<string, number> = {}
  return {
    add({ channel }) {
      if (!map[channel]) {
        map[channel] = 1
        outgoing.subscribe(channel, callback)
      } else {
        map[channel]++
      }
    },
    remove({ channel }) {
      if (map[channel]) {
        map[channel]--
        if (!map[channel]) {
          outgoing.unsubscribe(channel, callback)
          delete map[channel]
        }
      }
    },
    clear() {
      for (const channel in map) {
        outgoing.unsubscribe(channel, callback)
      }
      map = {}
    },
  }
}
export const sendBack: SendBack = operations => {
  operations.forEach(operation => {
    outgoing.publish(operation.channel, operation)
  })
}
