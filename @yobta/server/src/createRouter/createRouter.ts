import { pathToRegexp, match, MatchFunction } from 'path-to-regexp'

// region types
type Options = Parameters<typeof pathToRegexp>[2]

type AnyParams = {}
type AnyData = any // eslint-disable-line @typescript-eslint/no-explicit-any
type AnyOverloads = AnyData[]

type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
  ? []
  : S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S]

type PathToParams<PathArray, Params = {}> = PathArray extends [
  infer First,
  ...infer Rest,
]
  ? First extends `:${infer Param}`
    ? // eslint-disable-next-line @typescript-eslint/no-shadow
      First extends `:${infer Param}?`
      ? PathToParams<Rest, Params & Partial<Record<Param, string>>>
      : PathToParams<Rest, Params & Record<Param, string>>
    : PathToParams<Rest, Params>
  : Params

type ParseUrl<Path extends string> = PathToParams<Split<Path, '/'>>

type Callback<
  TParams extends AnyParams,
  TData extends AnyData,
  TOverloads extends AnyOverloads,
> = (params: TParams, data: TData, ...overloads: TOverloads) => void

type MatcherItem<TData extends AnyData, TOverloads extends AnyOverloads> = {
  callbacks: Set<Callback<AnyParams, TData, TOverloads>>
  matcher: MatchFunction
  path: string
}

type MatchersMap<TData extends AnyData, TOverloads extends AnyOverloads> = Map<
  string,
  MatcherItem<TData, TOverloads>
>

interface RouterFactory {
  <TData extends AnyData, TOverloads extends AnyOverloads>(options?: Options): {
    subscribe<Path extends string>(
      path: Path,
      callback: Callback<ParseUrl<Path>, TData, TOverloads>,
    ): VoidFunction
    publish(path: string, data: TData, ...overloads: TOverloads): boolean
  }
}

// endregion

export const createRouter: RouterFactory = <
  TData extends AnyData,
  TOverloads extends AnyOverloads,
>(
  options?: Options,
) => {
  const matchersMap: MatchersMap<TData, TOverloads> = new Map()
  return {
    subscribe(
      path,
      callback: Callback<ParseUrl<typeof path>, TData, TOverloads>,
    ) {
      const anyCallback = callback as Callback<AnyParams, TData, TOverloads>
      const item = matchersMap.get(path) || {
        callbacks: new Set(),
        matcher: match(path, options),
        path,
      }
      item.callbacks.add(anyCallback)
      matchersMap.set(path, item)
      return () => {
        matchersMap.get(path)?.callbacks.delete(anyCallback)
      }
    },
    publish(path, data: TData, ...overloads: TOverloads) {
      const matchedCallbacks = new Set<{
        callback: Callback<AnyParams, TData, TOverloads>
        params: AnyParams
      }>()
      matchersMap.forEach(item => {
        const matchResult = item.matcher(path)
        if (matchResult) {
          item.callbacks.forEach(callback => {
            matchedCallbacks.add({
              callback,
              params: matchResult.params as AnyParams,
            })
          })
        }
      })
      matchedCallbacks.forEach(({ callback, params }) => {
        callback(params, data, ...overloads)
      })
      return matchedCallbacks.size > 0
    },
  }
}
