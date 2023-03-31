import { shallowDiff } from './index.js'

describe('plainObjectDiff', () => {
  it('should return the differences between two plain objects', () => {
    const oldObject = {
      name: 'John',
      age: 30,
      city: 'New York',
    }
    const newObject = {
      name: 'Jane',
      age: 31,
      city: 'New York',
    }
    const diff = shallowDiff(oldObject, newObject)
    expect(diff).toEqual({
      name: 'Jane',
      age: 31,
    })
  })

  it('should return null if there are no differences', () => {
    const oldObject = {
      name: 'John',
      age: 30,
      city: 'New York',
    }
    const newObject = {
      name: 'John',
      age: 30,
      city: 'New York',
    }
    const diff = shallowDiff(oldObject, newObject)
    expect(diff).toBeNull()
  })
})
