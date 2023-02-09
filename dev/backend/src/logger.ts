import pino from 'pino'

const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
})

export const log = logger.info.bind(logger)
