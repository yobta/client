import {
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_INSERT,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_COLLECTION_CREATE,
  YobtaChannelOperation,
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
      const query = sql`
        SELECT * FROM yobta_channel_revalidate(${collection}, ${channel}, ${merged})
      `
      return db.queryNodeStream(query)
    },
    merge: async (collection, operation) => {
      const merged = Date.now()
      switch (operation.type) {
        case YOBTA_CHANNEL_INSERT:
        case YOBTA_CHANNEL_DELETE:
        case YOBTA_CHANNEL_RESTORE:
        case YOBTA_CHANNEL_SHIFT: {
          const result = await db.query(sql`
            WITH ins AS (
              INSERT INTO yobta_channel ("id", "type", "collection", "channel", "snapshotId", "nextSnapshotId", "committed", "merged")
              VALUES (${operation.id}, ${operation.type}, ${collection}, ${operation.channel}, ${operation.snapshotId}, ${operation.nextSnapshotId}, ${operation.committed}, ${merged})
              ON CONFLICT ("id") DO NOTHING RETURNING *
            )
            SELECT * FROM ins
            UNION ALL
            SELECT * FROM yobta_channel
            WHERE "id" = ${operation.id} AND NOT EXISTS (SELECT * FROM ins)
            LIMIT 1
          `)
          const mergedOperation: YobtaChannelOperation = {
            id: result[0].id,
            type: result[0].type,
            channel: result[0].channel,
            snapshotId: result[0].snapshotId,
            committed: result[0].committed,
            merged: result[0].merged,
          }
          next(mergedOperation)
          return mergedOperation
        }
        case YOBTA_COLLECTION_CREATE: {
          const query = sql`
            SELECT * FROM yobta_collection_create(${collection}, ${merged}, ${operation})
          `
          const result = await db.query(query)
          const mergedOperation = result[0].yobta_collection_create
          return mergedOperation
        }
        default: {
          const mergedOperation = {
            ...operation,
            merged,
          }
          next(mergedOperation)
          return mergedOperation
        }
      }
    },
    observe,
  }
}
