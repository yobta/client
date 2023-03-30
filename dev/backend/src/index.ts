import { WebSocketServer } from 'ws'
import { createServer, serverLogger } from '@yobta/server'

import './pinoLogger.js'
import './modules/todos/todos.js'

serverLogger.info('Starting backend...')

// https://blog.jayway.com/2015/04/13/600k-concurrent-websocket-connections-on-aws-using-node-js/

const wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
  verifyClient(info, done) {
    // todo: verify token and origin
    // info.req.headers.token
    // info.origin
    done(true)
  },
})

createServer(wss)

serverLogger.info('Backend started on port 8080')
