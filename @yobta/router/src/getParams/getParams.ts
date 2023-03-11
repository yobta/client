import { YobtaRouteParams } from '../createRouter/createRouter.js'
import { normalizePath } from '../normalizePath/normalizePath.js'
import { YobtaParsedRoute } from '../parseRoute/parseRoute.js'

interface YobtaGetParams {
  <Route extends string>(route: YobtaParsedRoute<Route>, path: string):
    | undefined
    | YobtaRouteParams<Route>
}

export const getParams: YobtaGetParams = <Path extends string>(
  { regex, paramNames }: YobtaParsedRoute<Path>,
  rawPath: string,
) => {
  const path = normalizePath(rawPath)
  const emptyParams = {} as YobtaRouteParams<Path>
  if (!paramNames.length) {
    return regex.test(path) ? emptyParams : undefined
  }
  return path
    .match(regex)
    ?.slice(1)
    .reduce<YobtaRouteParams<Path>>(
      (params, match, index) =>
        match
          ? Object.assign(params, { [paramNames[index] as string]: match })
          : params,
      emptyParams,
    )
}
