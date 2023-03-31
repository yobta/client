import { findLastIndex } from './index.js'

const isEven = (value: number): boolean => value % 2 === 0

it('should return the last index where the predicate is true', () => {
  const inputArray = [1, 2, 3, 4, 5, 2]
  const result = findLastIndex(inputArray, isEven)
  expect(result).toBe(5)
})

it('should return -1 when the predicate is never true', () => {
  const inputArray = [1, 3, 5, 7, 9]
  const result = findLastIndex(inputArray, isEven)
  expect(result).toBe(-1)
})

it('should return -1 when the input array is empty', () => {
  const inputArray: number[] = []
  const result = findLastIndex(inputArray, isEven)
  expect(result).toBe(-1)
})

it('should provide the correct arguments to the predicate', () => {
  const inputArray = [1, 2, 3]
  const predicate = vi.fn(value => value % 2 === 0)
  findLastIndex(inputArray, predicate)

  expect(predicate).toHaveBeenCalledTimes(2)
  expect(predicate).toHaveBeenNthCalledWith(1, 3, 2, inputArray)
  expect(predicate).toHaveBeenNthCalledWith(2, 2, 1, inputArray)
})

it('should handle objects in the array', () => {
  const inputArray = [
    { id: 1, value: 'one' },
    { id: 2, value: 'two' },
    { id: 3, value: 'three' },
    { id: 2, value: 'four' },
  ]
  const hasIdTwo = (item: { id: number; value: string }): boolean =>
    item.id === 2
  const result = findLastIndex(inputArray, hasIdTwo)
  expect(result).toBe(3)
})

it('should handle an array with multiple data types', () => {
  const inputArray = [1, 'two', { id: 3, value: 'three' }, 'four', 5]
  const isString = (item: any): boolean => typeof item === 'string'
  const result = findLastIndex(inputArray, isString)
  expect(result).toBe(3)
})
