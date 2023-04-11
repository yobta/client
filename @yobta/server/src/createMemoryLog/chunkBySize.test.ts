import { chunkBySize } from './chunkBySize.js'

describe('chunkBySize', () => {
  it('should return empty array for empty input', () => {
    const result = chunkBySize([], 5)
    expect(result).toEqual([])
  })

  it('should split operations into chunks based on size', () => {
    const operations = ['a', 'b', 'c', 'd', 'e']
    const sizeA = Buffer.byteLength(JSON.stringify('a'))
    const sizeB = Buffer.byteLength(JSON.stringify('b'))
    const chunkSize = sizeA + sizeB
    const result = chunkBySize(operations, chunkSize)
    expect(result).toEqual([['a', 'b'], ['c', 'd'], ['e']])
  })

  it('should handle operations with varying sizes', () => {
    const operations = ['a', { a: 'a', b: 'b' }, 'c', { c: 'c' }, 'd']
    const sizeA = Buffer.byteLength(JSON.stringify('a'))
    const sizeObj = Buffer.byteLength(JSON.stringify({ a: 'a', b: 'b' }))
    const chunkSize = sizeA + sizeObj
    const result = chunkBySize(operations, chunkSize)
    expect(result).toEqual([
      ['a', { a: 'a', b: 'b' }],
      ['c', { c: 'c' }, 'd'],
    ])
  })

  it('should create a single chunk if total size is within chunkSize', () => {
    const operations = ['a', 'b', 'c']
    const chunkSize = Buffer.byteLength(JSON.stringify(['a', 'b', 'c']))

    const result = chunkBySize(operations, chunkSize)

    expect(result).toEqual([['a', 'b', 'c']])
  })

  it('should create a chunk for each operation if every operation exceeds chunkSize', () => {
    const operations = ['a', 'b', 'c']
    const chunkSize = 1

    const result = chunkBySize(operations, chunkSize)

    expect(result).toEqual([['a'], ['b'], ['c']])
  })
})
