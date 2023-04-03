/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { YobtaCollectionAnySnapshot } from '@yobta/protocol'

import { YobtaClientLogOperation } from '../createClientLog/createClientLog.js'
import {
  YobtaClientStore,
  createMemoryStore,
} from '../createMemoryStore/createMemoryStore.js'

interface YobtaIndexedDbStoreFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    scope: string,
    version: number,
  ): YobtaClientStore<Snapshot>
}

const isSupported = (): boolean => {
  try {
    return 'indexedDB' in window
  } catch (error) {
    return false
  }
}
export const createIndexedDbStore: YobtaIndexedDbStoreFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  scope: string,
  version: number,
) => {
  if (!isSupported()) {
    return createMemoryStore(scope)
  }
  const dbName = `yobta-${scope}`
  let dbPromise: Promise<IDBDatabase> | null = null
  const getDb = async (): Promise<IDBDatabase> => {
    if (!dbPromise) {
      dbPromise = openDatabase(dbName, version)
    }
    return dbPromise
  }
  return {
    async fetch(
      channel?: string,
    ): Promise<YobtaClientLogOperation<Snapshot>[]> {
      const db = await getDb()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('operations', 'readonly')
        const objectStore = transaction.objectStore('operations')
        const request = channel
          ? objectStore.index('channel').openCursor(IDBKeyRange.only(channel))
          : objectStore.openCursor()
        const operations: YobtaClientLogOperation<Snapshot>[] = []
        request.onsuccess = event => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
          if (cursor) {
            operations.push(cursor.value)
            cursor.continue()
          } else {
            resolve(
              operations.sort(
                (a, b) =>
                  a.committed - b.committed || Number(a.id) - Number(b.id),
              ),
            )
          }
        }
        request.onerror = event => {
          reject((event.target as IDBRequest).error)
        }
      })
    },
    async put(entries: YobtaClientLogOperation<Snapshot>[]): Promise<void> {
      const db = await getDb()
      const transaction = db.transaction('operations', 'readwrite')
      const objectStore = transaction.objectStore('operations')
      for (const entry of entries) {
        const getRequest = objectStore.get(entry.id)
        getRequest.onsuccess = event => {
          const existingEntry = (
            event.target as IDBRequest<YobtaClientLogOperation<Snapshot>>
          ).result
          if (existingEntry) {
            if (entry.merged > 0 && existingEntry.merged === 0) {
              objectStore.put(entry)
            }
          } else {
            objectStore.add(entry)
          }
        }
      }
      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          resolve()
        }
        transaction.onerror = event => {
          reject((event.target as IDBRequest).error)
        }
      })
    },
    async clear(): Promise<void> {
      const db = await getDb()
      const transaction = db.transaction('operations', 'readwrite')
      const objectStore = transaction.objectStore('operations')
      objectStore.clear()
    },
  }
}

const openDatabase = (name: string, version: number): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(name, version)
    openRequest.onupgradeneeded = function (event) {
      const db = (event.target as IDBOpenDBRequest).result
      const objectStore = db.createObjectStore('operations', {
        keyPath: 'id',
        autoIncrement: true,
      })
      objectStore.createIndex('channel', 'channel', { unique: false })
    }
    openRequest.onsuccess = function (event) {
      resolve((event.target as IDBOpenDBRequest).result)
    }
    openRequest.onerror = function (event) {
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}
