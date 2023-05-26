import {
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_INSERT,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_COLLECTION_CREATE,
  YOBTA_COLLECTION_UPDATE,
  YobtaCollectionAnySnapshot,
  YobtaServerLog,
} from '@yobta/protocol'
import { Queryable, sql } from '@databases/pg'
import { createObservable } from '@yobta/stores'

interface PgLogFactory {
  (props: { db: Queryable }): YobtaServerLog<YobtaCollectionAnySnapshot>
}

export const createPgLog: PgLogFactory = ({ db }) => {
  const { observe, next } = createObservable()
  return {
    find: ({ collection, channel, merged }) => {
      const query = sql`SELECT * FROM yobta_channel_revalidate(${collection}, ${channel}, ${merged})`
      return db.queryNodeStream(query)
    },
    merge: async (collection, operation) => {
      switch (operation.type) {
        case YOBTA_CHANNEL_INSERT:
        case YOBTA_CHANNEL_DELETE:
        case YOBTA_CHANNEL_RESTORE:
        case YOBTA_CHANNEL_SHIFT: {
          const query = sql`SELECT * FROM yobta_channel_insert(${collection}, ${operation})`
          const [{ yobta_channel_insert: insertOperation }] = await db.query(
            query,
          )
          next(insertOperation)
          return insertOperation
        }
        case YOBTA_COLLECTION_CREATE: {
          const query = sql`SELECT * FROM yobta_collection_create(${collection}, ${operation})`
          const [{ yobta_collection_create: mergedOperation }] = await db.query(
            query,
          )
          return mergedOperation
        }
        case YOBTA_COLLECTION_UPDATE: {
          const query = sql`SELECT * FROM yobta_collection_update(${collection}, ${operation})`
          const [{ yobta_collection_update: mergedOperation }] = await db.query(
            query,
          )
          return mergedOperation
        }
        default: {
          throw new Error('Unknown operation type')
        }
      }
    },
    observe,
  }
}
