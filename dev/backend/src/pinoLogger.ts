import pino from 'pino'

const logger = pino({
  level: 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      multiline: true,
    },
  },
})

export const pinoLogger = {
  info: logger.info.bind(logger),
  error: logger.error.bind(logger),
  warn: logger.warn.bind(logger),
  debug: logger.debug.bind(logger),
  log: logger.info.bind(logger),
}
