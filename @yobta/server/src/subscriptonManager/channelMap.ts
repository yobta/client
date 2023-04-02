/* eslint-disable @typescript-eslint/no-unnecessary-condition */
interface YobtaChannelMapFactory {
  (): {
    add(channel: string, clientId: string): boolean
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
      const added = !map[channel].has(clientId)
      map[channel].add(clientId)
      return added
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
