import { YobtaAnyPlainObject } from '@yobta/stores'

interface YobtaShallowDiff {
  <PlainObject extends YobtaAnyPlainObject>(
    oldObject: YobtaAnyPlainObject,
    newObject: Partial<PlainObject>,
  ): Partial<PlainObject> | null
}

export const shallowDiff: YobtaShallowDiff = (oldObject, newObject) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diff: any = {}
  for (const key in oldObject) {
    if (oldObject[key] !== newObject[key]) {
      diff[key] = newObject[key]
    }
  }
  return Object.keys(diff).length > 0 ? diff : null
}
