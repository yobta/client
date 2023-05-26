import {
  YOBTA_CHANNEL_DELETE,
  YOBTA_CHANNEL_INSERT,
  YOBTA_CHANNEL_RESTORE,
  YOBTA_CHANNEL_SHIFT,
  YOBTA_COLLECTION_CREATE,
  YOBTA_COLLECTION_UPDATE,
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
      switch (operation.type) {
        case YOBTA_CHANNEL_INSERT:
        case YOBTA_CHANNEL_DELETE:
        case YOBTA_CHANNEL_RESTORE:
        case YOBTA_CHANNEL_SHIFT: {
          const result = await db.query(sql`
            WITH ins AS (
              INSERT INTO yobta_channel ("operationId", "type", "collection", "channel", "snapshotId", "nextSnapshotId", "committed", "merged")
              VALUES (${operation.id}, ${operation.type}, ${collection}, ${
            operation.channel
          }, ${operation.snapshotId}, ${operation.nextSnapshotId}, ${
            operation.committed
          }, ${Date.now()})
              ON CONFLICT ("operationId") DO NOTHING RETURNING *
            )
            SELECT * FROM ins
            UNION ALL
            SELECT * FROM yobta_channel
            WHERE "operationId" = ${
              operation.id
            } AND NOT EXISTS (SELECT * FROM ins)
            LIMIT 1
          `)
          const mergedOperation: YobtaChannelOperation = {
            id: result[0].operationId,
            type: result[0].type,
            channel: result[0].channel,
            snapshotId: result[0].snapshotId,
            nextSnapshotId: result[0].nextSnapshotId,
            committed: result[0].committed,
            merged: result[0].merged,
          }
          next(mergedOperation)
          return mergedOperation
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
