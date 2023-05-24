import { createMemoryLog } from '@yobta/server'
import createConnectionPool from '@databases/pg'
import { createPgLog } from '@yobta/pg'

export const db = createConnectionPool()

export const memoryLog = createMemoryLog()

export const pgLog = createPgLog({ db })
