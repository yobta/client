import { YobtaOnlineStore } from '@yobta/stores'
import { YobtaClientOperation } from '@yobta/protocol'

import {
  YobtaTransport,
  YobtaTransportConnection,
} from '../websocketYobta/websocketYobta.js'
import {
  connectionStore,
  YOBTA_OPEN,
} from '../connectionStore/connectionStore.js'
import { timeoutYobta } from '../timeoutYobta/timeoutYobta.js'
import { operationsQueue, observeQueue } from '../queue/queue.js'
import { isMainTab, mainStore } from '../mainStore/mainStore.js'
import { encoderYobta, YobtaClientEncoder } from '../encoder/encoder.js'
import { handleRemoteOperation } from '../subscriptions/handleRemoteOperation.js'
import { getAllSubscribeOperarions } from '../subscriptions/getAllSubscribeOperarions.js'
import { remoteStore } from '../remoteStore/remoteStore.js'

interface ClientFactory {
  (config: {
    transport: YobtaTransport
    encoder?: YobtaClientEncoder
    internetObserver: YobtaOnlineStore
    getHeaders?: () => Record<string, string>
    messageTimeoutMs?: number
  }): () => VoidFunction
}

export type CrosstabYobta = ReturnType<ClientFactory>

const BEFORE_UNLOAD = 'beforeunload'

export const clientYobta: ClientFactory = ({
  transport,
  encoder = encoderYobta(),
  internetObserver,
  getHeaders,
  messageTimeoutMs = 3600,
}) => {
  let connection: YobtaTransportConnection | null = null
  let timer = timeoutYobta()
  let connect: VoidFunction = () => {
    if (!connection && isMainTab() && internetObserver.last()) {
      connection = transport({
        onMessage(message) {
          let decoded = encoder.decode(message)
          remoteStore.next(decoded)
          timer.stopAll()
        },
        onStatus: connectionStore.next,
      })
    }
  }
  let disconnect: VoidFunction = () => {
    if (connection) {
      connection.close()
      connection = null
    }
  }
  let reconnect: VoidFunction = () => {
    disconnect()
    connect()
  }
  let send = (operation: YobtaClientOperation): void => {
    if (connection?.isOpen()) {
      let encoded = encoder.encode({
        headers: getHeaders?.(),
        operation,
      })
      connection.send(encoded)
      timer.start(reconnect, messageTimeoutMs)
    }
  }
  return () => {
    let unmount: VoidFunction[] = [
      connectionStore.observe(state => {
        timer.stopAll()
        if (state === YOBTA_OPEN) {
          ;[
            ...operationsQueue.values(),
            ...getAllSubscribeOperarions(),
          ].forEach(send)
        } else {
          timer.start(reconnect, 2000)
        }
        !isMainTab() && disconnect()
      }),
      observeQueue(send),
      internetObserver.observe(hasInternet => {
        hasInternet ? reconnect() : disconnect()
      }),
      mainStore.observe(isMain => {
        isMain ? connect() : disconnect()
      }),
      remoteStore.observe(handleRemoteOperation),
    ]
    let teardown: VoidFunction = () => {
      disconnect()
      timer.stopAll()
      unmount.forEach(u => {
        u()
      })
      window.removeEventListener(BEFORE_UNLOAD, teardown)
    }
    window.addEventListener(BEFORE_UNLOAD, teardown)
    return teardown
  }
}
