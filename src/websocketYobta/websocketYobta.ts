import { observableYobta } from '@yobta/stores'

const YOBTA_STATE = 'yobta_state'
const YOBTA_MESSAGE = 'yobta_message'
const CONNECTING = 'CONNECTING'
const OPEN = 'OPEN'
const CLOSING = 'CLOSING'
const CLOSED = 'CLOSED'
const ERROR = 'ERROR'

export interface YobtaTransport {
  (props: { url: string | URL; protocols?: string | string[] | undefined }): {
    connect: VoidFunction
    disconnect: VoidFunction
    observe(
      observer: (
        action:
          | [typeof YOBTA_STATE, typeof CONNECTING]
          | [typeof YOBTA_STATE, typeof OPEN, Event]
          | [typeof YOBTA_STATE, typeof ERROR, Event]
          | [typeof YOBTA_STATE, typeof CLOSED, CloseEvent]
          | [typeof YOBTA_STATE, typeof CLOSING]
          | [typeof YOBTA_MESSAGE, any],
      ) => void,
    ): void
    send(message: string): void
  }
}

type YobtaTransportAction = Parameters<
  Parameters<ReturnType<YobtaTransport>['observe']>[0]
>[0]

export const websocketYobta: YobtaTransport = ({ url, protocols }) => {
  let client: WebSocket | null = null

  let store = observableYobta<YobtaTransportAction>(
    [] as unknown as YobtaTransportAction,
  )

  return {
    connect() {
      if (!client) {
        client = new WebSocket(url, protocols)
        store.next([YOBTA_STATE, CONNECTING])

        client.onopen = event => {
          store.next([YOBTA_STATE, OPEN, event])
        }
        client.onmessage = event => {
          store.next([YOBTA_MESSAGE, event.data])
        }
        client.onerror = event => {
          client = null
          store.next([YOBTA_STATE, ERROR, event])
        }
        client.onclose = event => {
          client = null
          store.next([YOBTA_STATE, CLOSED, event])
        }
      }
    },
    disconnect() {
      if (client) {
        store.next([YOBTA_STATE, CLOSING])
        client.close()
      }
    },
    send(message) {
      if (!client) {
        throw new Error('Please connect before sending')
      }
      if (client.readyState !== 1) {
        throw new Error('Websocket is not ready')
      }
      client.send(message)
    },
    observe: store.observe,
  }
}
