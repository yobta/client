import { normalizePath } from '../normalizePath/normalizePath.js'
import { parseRoute } from '../parseRoute/parseRoute.js'

interface YobtaRouterTestRoute {
  (route: string, path: string): boolean
}

export const testRoute: YobtaRouterTestRoute = (route, path) => {
  const { regex } = parseRoute(route)
  const normalizedPath = normalizePath(path)
  return regex.test(normalizedPath)
}
