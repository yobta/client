/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { YobtaCollectionAnySnapshot } from '@yobta/protocol'

import {
  createClientLog,
  YobtaClientLogOperation,
  YobtaClientLog,
} from '../createClientLog/createClientLog.js'

interface YobtaClientStoreFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    scope: string,
  ): YobtaClientStore<Snapshot>
}

export type YobtaClientStore<Snapshot extends YobtaCollectionAnySnapshot> = {
  fetch(channel?: string): Promise<YobtaClientLogOperation<Snapshot>[]>
  put(entries: YobtaClientLogOperation<Snapshot>[]): Promise<void>
  clear(): Promise<void>
}

export const createMemoryStore: YobtaClientStoreFactory = <
  Snapshot extends YobtaCollectionAnySnapshot,
>(
  scope: string,
) => {
  const map: Record<string, YobtaClientLog<Snapshot>> = {}
  const getLog = (): YobtaClientLog<Snapshot> => {
    if (!map[scope]) {
      map[scope] = createClientLog<Snapshot>([])
    }
    return map[scope]
  }
  return {
    async fetch(
      channel?: string,
    ): Promise<YobtaClientLogOperation<Snapshot>[]> {
      const operations = getLog().last()
      return channel
        ? operations.filter(({ channel: opChannel }) => opChannel === channel)
        : operations
    },
    async put(entries: YobtaClientLogOperation<Snapshot>[]): Promise<void> {
      getLog().add(entries)
    },
    async clear(): Promise<void> {
      delete map[scope]
    },
  }
}
