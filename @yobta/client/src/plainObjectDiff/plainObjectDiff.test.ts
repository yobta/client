import { plainObjectDiff } from './plainObjectDiff.js'

describe('plainObjectDiff', () => {
  it('should return the differences between two plain objects', () => {
    let oldObject = {
      name: 'John',
      age: 30,
      city: 'New York',
    }
    let newObject = {
      name: 'Jane',
      age: 31,
      city: 'New York',
    }
    let diff = plainObjectDiff(oldObject, newObject)
    expect(diff).toEqual({
      name: 'Jane',
      age: 31,
    })
  })

  it('should return null if there are no differences', () => {
    let oldObject = {
      name: 'John',
      age: 30,
      city: 'New York',
    }
    let newObject = {
      name: 'John',
      age: 30,
      city: 'New York',
    }
    let diff = plainObjectDiff(oldObject, newObject)
    expect(diff).toBeNull()
  })
})
