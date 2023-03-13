import { YobtaRouteParams } from '../createRouter/createRouter.js'
import { normalizePath } from '../normalizePath/normalizePath.js'
import { YobtaParsedRoute } from '../parseRoute/parseRoute.js'

interface YobtaRouterGetParams {
  <Route extends string>(
    route: YobtaParsedRoute<Route>,
    path: string,
  ): YobtaRouteParams<Route>
}

export const getParams: YobtaRouterGetParams = <Path extends string>(
  { regex, paramNames, route }: YobtaParsedRoute<Path>,
  rawPath: string,
) => {
  const path = normalizePath(rawPath)
  const emptyParams = {} as YobtaRouteParams<Path>
  const matches = path.match(regex)
  if (!matches) {
    throw new Error(`Path '${path}' does not match route '${route}'`)
  }
  return matches
    .slice(1)
    .reduce<YobtaRouteParams<Path>>(
      (params, match, index) =>
        match
          ? Object.assign(params, { [paramNames[index] as string]: match })
          : params,
      emptyParams,
    )
}
