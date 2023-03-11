import { getParams } from '../getParams/getParams.js'
import { normalizePath } from '../normalizePath/normalizePath.js'
import { parseRoute, YobtaParsedRoute } from '../parseRoute/parseRoute.js'
import { matchRoute } from '../matchRoute/matchRoute.js'

// #region  types
export type YobtaAnyParams = Record<string, string>
export type YobtaRouterCallback<
  Route extends string,
  Overloads extends AnyOverloads,
> = (params: YobtaRouteParams<Route>, ...overloads: Overloads) => void
export type YobtaRouter = {
  subscribe<Route extends string, Overloads extends AnyOverloads>(
    route: Route,
    callback: YobtaRouterCallback<Route, Overloads>,
  ): VoidFunction
  publish(path: string, ...overloads: AnyOverloads): boolean
}
export type YobtaRouteParams<Route extends string> = RouteToParams<
  YobtaSplitPath<Route, '/'>
>

type AnyData = any // eslint-disable-line @typescript-eslint/no-explicit-any
type AnyOverloads = AnyData[]
type YobtaSplitPath<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
  ? []
  : S extends `${infer T}${D}${infer U}`
  ? [T, ...YobtaSplitPath<U, D>]
  : [S]
type RouteToParams<PathArray, Params = {}> = PathArray extends [
  infer First,
  ...infer Rest,
]
  ? First extends `:${infer Param}`
    ? // eslint-disable-next-line @typescript-eslint/no-shadow
      First extends `:${infer Param}?`
      ? RouteToParams<Rest, Params & Partial<Record<Param, string>>>
      : RouteToParams<Rest, Params & Record<Param, string>>
    : RouteToParams<Rest, Params>
  : Params
type Heap = Map<string, HeapItem>
type HeapItem = {
  callbacks: Set<YobtaRouterCallback<string, AnyOverloads>>
  parsedRoute: YobtaParsedRoute<string>
}
interface YobtaRouterFactory {
  (): YobtaRouter
}
// #endregion

export const createRouter: YobtaRouterFactory = () => {
  const heap: Heap = new Map()
  const findItem = (path: string): HeapItem | undefined => {
    const key = [...heap.keys()].find(route => matchRoute(route, path))
    return key ? heap.get(key) : undefined
  }
  const subscribe: YobtaRouter['subscribe'] = (unknownRoute, callback) => {
    const parsedRoute = parseRoute(unknownRoute)
    const anyCallback = callback as unknown as YobtaRouterCallback<
      string,
      AnyOverloads
    >
    const item = heap.get(parsedRoute.id) || {
      callbacks: new Set(),
      parsedRoute,
    }
    item.callbacks.add(anyCallback)
    heap.set(parsedRoute.id, item as HeapItem)
    return () => {
      heap.get(parsedRoute.id)?.callbacks.delete(anyCallback)
    }
  }
  const publish: YobtaRouter['publish'] = (path, ...overloads) => {
    const item = findItem(path)
    if (item) {
      const params = getParams(item.parsedRoute, path)
      item.callbacks.forEach(callback => {
        callback(params!, ...overloads)
      })
    }
    return !!item
  }
  return {
    publish,
    subscribe,
  }
}
