import { normalizePath } from '../normalizePath/normalizePath.js'
import { parseRoute } from '../parseRoute/parseRoute.js'

interface MatchRoute {
  (route: string, path: string): boolean
}

export const matchRoute: MatchRoute = (route, path) => {
  const { regex } = parseRoute(route)
  const normalizedPath = normalizePath(path)
  return regex.test(normalizedPath)
}
