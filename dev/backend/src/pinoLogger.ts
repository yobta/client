import pino from 'pino'
import { connectLogger } from '@yobta/logger'
import { serverLogger } from '@yobta/server'

const pinoLogger = pino({
  // level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      multiline: true,
    },
  },
})

connectLogger(serverLogger, pinoLogger)
