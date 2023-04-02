/* eslint-disable @typescript-eslint/no-unnecessary-condition */
interface YobtaChannelMapFactory {
  (): {
    add(channel: string, clientId: string): Set<string>
    remove(channel: string, clientId: string): boolean
    clear(): void
    keys(): string[]
  }
}

export const createChannelMap: YobtaChannelMapFactory = () => {
  let map: Record<string, Set<string>> = {}
  return {
    add(channel, clientId) {
      if (!map[channel]) {
        map[channel] = new Set()
      }
      return map[channel].add(clientId)
    },
    remove(channel, clientId) {
      if (map[channel]) {
        map[channel].delete(clientId)
        if (!map[channel].size) {
          delete map[channel]
          return true
        }
      }
      return false
    },
    clear() {
      map = {}
    },
    keys() {
      return Object.keys(map)
    },
  }
}
