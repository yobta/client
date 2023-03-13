import { YobtaRouterCallback } from '../createRouter/createRouter.js'
import { testRoute } from '../testRoute/testRoute.js'
import { YobtaParsedRoute } from '../parseRoute/parseRoute.js'

export type YobtaRouterHeap = Map<string, YobtaRouterHeapItem>
export type YobtaRouterHeapItem = {
  callbacks: Set<YobtaRouterCallback<string, unknown[]>>
  parsedRoute: YobtaParsedRoute<string>
}

interface YobtaRouterCheckConllisions {
  <Route extends string>(
    heap: YobtaRouterHeap,
    route: YobtaParsedRoute<Route>,
  ): void
}

export const checkCollision: YobtaRouterCheckConllisions = (
  heap,
  { id, route },
): void => {
  for (const { parsedRoute } of heap.values()) {
    if (id !== parsedRoute.id && testRoute(parsedRoute.route, route)) {
      throw new Error(`Route '${route}' conflicts with '${parsedRoute.route}'`)
    }
  }
}
