import { YobtaRouteParams } from '../createRouter/createRouter.js'
import { normalizePath } from '../normalizePath/normalizePath.js'

interface YobtaParseRoute {
  <Route extends string>(route: Route): YobtaParsedRoute<Route>
}
export type YobtaParsedRoute<Route extends string> = {
  id: Route
  paramNames: ParamsTuple<Route>
  regex: RegExp
  route: Route
}

type UnionToIntersection<U> = (
  U extends never ? never : (arg: U) => never
) extends (arg: infer I) => void
  ? I
  : never
type UnionToTuple<T> = UnionToIntersection<
  T extends never ? never : (t: T) => T
> extends (_: never) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : []
type ParamsTuple<Route extends string> = UnionToTuple<
  keyof YobtaRouteParams<Route>
>

export const parseRoute: YobtaParseRoute = <Route extends string>(
  unsafeRoute: Route,
) => {
  const route = normalizePath(unsafeRoute) as Route
  const id = route.toLowerCase() as Route
  const paramNames = (route.match(/\/:\w+/g) || []).map(match =>
    match.slice(2),
  ) as ParamsTuple<Route>
  const pattern = id
    .replace(/[\s!#$()+,.:<=?[\\\]^{|}]/g, '\\$&')
    .replace(/\/\\:\w+\\\?/g, '/?([^/]*)')
    .replace(/\/\\:\w+/g, '/([^/]+)')
  const regex = RegExp('^' + pattern + '$', 'i')
  return { id, paramNames, regex, route }
}
