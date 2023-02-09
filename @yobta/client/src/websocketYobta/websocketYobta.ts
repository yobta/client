import {
  YOBTA_CLOSED,
  YOBTA_CLOSING,
  YOBTA_CONNECTING,
  YOBTA_CONNECTION_STATE,
  YOBTA_CONNECTION_ERROR,
  YOBTA_OPEN,
} from '../connectionStore/connectionStore.js'

interface TransportFactory {
  (config: {
    debug?: <Message>(event: Event | CloseEvent | MessageEvent<Message>) => void
    protocols?: string | string[] | undefined
    url: string | URL
  }): (handlers: {
    onMessage(message: string): void
    onStatus(action: YOBTA_CONNECTION_STATE): void
  }) => {
    close(): void
    isOpen(): boolean
    send(message: string): void
  }
}

export type YobtaTransport = ReturnType<TransportFactory>
export type YobtaTransportConnection = ReturnType<YobtaTransport>
export type YobtaTransportOnMessage = Parameters<YobtaTransport>[0]['onMessage']
export type YobtaTransportOnStatus = Parameters<YobtaTransport>[0]['onStatus']

export const websocketYobta: TransportFactory =
  ({ url, protocols, debug }) =>
  ({ onMessage, onStatus }) => {
    onStatus(YOBTA_CONNECTING)

    const client: WebSocket = new WebSocket(url, protocols)
    const senDebug = (event: Event | CloseEvent | MessageEvent<string>): void => {
      if (debug) {
        debug(event)
      }
    }
    client.onopen = event => {
      onStatus(YOBTA_OPEN)
      senDebug(event)
    }
    client.onclose = event => {
      onStatus(YOBTA_CLOSED)
      senDebug(event)
    }
    client.onerror = event => {
      onStatus(YOBTA_CONNECTION_ERROR)
      senDebug(event)
    }
    client.onmessage = event => {
      onMessage(event.data)
      senDebug(event)
    }

    return {
      isOpen: () => client.readyState === WebSocket.OPEN,
      close() {
        onStatus(YOBTA_CLOSING)
        client.close()
      },
      send(message) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      },
    }
  }
