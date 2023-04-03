/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { YobtaCollectionAnySnapshot } from '@yobta/protocol'

import {
  createClientLog,
  YobtaClientLogOperation,
  YobtaClientLog,
} from '../createClientLog/createClientLog.js'

interface YobtaStoreFactory {
  <Snapshot extends YobtaCollectionAnySnapshot>(
    scope: string,
  ): YobtaStore<Snapshot>
}

export type YobtaStore<Snapshot extends YobtaCollectionAnySnapshot> = {
  fetch(channel?: string): Promise<YobtaClientLogOperation<Snapshot>[]>
  put(entries: YobtaClientLogOperation<Snapshot>[]): Promise<void>
  clear(): Promise<void>
}

export const createMemoryStore: YobtaStoreFactory = <
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
