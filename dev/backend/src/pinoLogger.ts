import pino from 'pino'
import { connectLogger } from '@yobta/utils'
import { serverLogger } from '@yobta/server'

const pinoLogger = pino({
  // level: 'debug',
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      multiline: true,
    },
  },
})

connectLogger(serverLogger, pinoLogger)
