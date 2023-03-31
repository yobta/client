interface YobtaFindLastIndex {
  <Item>(
    array: Item[],
    predicate: (value: Item, index: number, array: Item[]) => boolean,
  ): number
}

export const findLastIndex: YobtaFindLastIndex = (array, predicate) => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i], i, array)) {
      return i
    }
  }
  return -1
}
