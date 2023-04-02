import {
  connectLogger,
  YobtaAnyLogger,
  createTimeoutManager,
} from '@yobta/utils'
import { YobtaOnlineStore } from '@yobta/stores'
import {
  YobtaClientOperation,
  YobtaCollectionAnySnapshot,
  YobtaHeaders,
} from '@yobta/protocol'
import { nanoid } from 'nanoid'

import {
  YobtaTransport,
  YobtaTransportConnection,
} from '../createWsTransport/createWsTransport.js'
import {
  connectionStore,
  YOBTA_OPEN,
} from '../connectionStore/connectionStore.js'
import { observeQueue, getQueuedClientOperations } from '../queue/queue.js'
import { isMainTab, mainStore } from '../mainStore/mainStore.js'
import { encoderYobta, YobtaClientEncoder } from '../encoder/encoder.js'
import {
  getAllSubscribeOperarions,
  handleRemoteOperation,
} from '../subscriptions/subscriptions.js'
import { remoteStore } from '../remoteStore/remoteStore.js'
import { clientLogger } from '../clientLogger/clientLogger.js'
import { trackClientTime } from '../serverTime/serverTime.js'

interface ClientFactory {
  (config: {
    encoder?: YobtaClientEncoder
    getHeaders(): YobtaHeaders
    internetObserver: YobtaOnlineStore
    logger?: YobtaAnyLogger
    messageTimeoutMs?: number
    transport: YobtaTransport
  }): () => VoidFunction
}

export type CrosstabYobta = ReturnType<ClientFactory>

const BEFORE_UNLOAD = 'beforeunload'

export const createClient: ClientFactory = ({
  logger,
  transport,
  encoder = encoderYobta(),
  internetObserver,
  getHeaders,
  messageTimeoutMs = 3600,
}) => {
  let connection: YobtaTransportConnection | null = null
  const clientId = nanoid()
  const timer = createTimeoutManager()
  const connect: VoidFunction = () => {
    if (!connection && isMainTab() && internetObserver.last()) {
      connection = transport({
        onMessage(message) {
          const decoded = encoder.decode(message)
          clientLogger.debug('Received message', decoded)
          remoteStore.next(decoded)
          timer.stopAll()
        },
        onStatus: connectionStore.next,
      })
    }
  }
  const disconnect: VoidFunction = () => {
    if (connection) {
      connection.close()
      connection = null
    }
  }
  const reconnect: VoidFunction = () => {
    disconnect()
    connect()
  }
  const send = (
    operation: YobtaClientOperation<YobtaCollectionAnySnapshot>,
  ): void => {
    if (connection?.isOpen()) {
      clientLogger.debug('send', operation)
      const encoded = encoder.encode({
        clientId,
        headers: getHeaders(),
        operation,
      })
      connection.send(encoded)
      trackClientTime(operation.id)
      timer.start(reconnect, messageTimeoutMs)
    }
  }
  return () => {
    let disconnectLogger: VoidFunction | null = null
    if (logger) {
      disconnectLogger = connectLogger(clientLogger, logger)
      clientLogger.debug('Logger connected')
    }
    const unmount: VoidFunction[] = [
      connectionStore.observe(state => {
        timer.stopAll()
        if (state === YOBTA_OPEN) {
          ;[
            ...getQueuedClientOperations(),
            ...getAllSubscribeOperarions(),
          ].forEach(send)
        } else {
          timer.start(reconnect, 6000)
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
    const teardown: VoidFunction = () => {
      disconnect()
      timer.stopAll()
      unmount.forEach(u => {
        u()
      })
      window.removeEventListener(BEFORE_UNLOAD, teardown)
      if (disconnectLogger) {
        clientLogger.debug('Logger disconnected')
        disconnectLogger()
      }
    }
    window.addEventListener(BEFORE_UNLOAD, teardown)
    return teardown
  }
}
