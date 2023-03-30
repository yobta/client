import { coerceError } from './index.js'

describe('parseUnknownError', () => {
  it('should return the same error if input is an instance of Error', () => {
    const inputError = new Error('Sample error')
    const result = coerceError(inputError)
    expect(result).toBe(inputError)
  })

  it('handles objects with message', () => {
    const inputObject = { message: 'Object error message' }
    const result = coerceError(inputObject)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe(inputObject.message)
  })

  it('handles objects without a message', () => {
    const inputObject = { foo: 'bar' }
    const result = coerceError(inputObject)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('Unknown error')
    // @ts-ignore
    expect(result.foo).toBe(inputObject.foo)
  })

  it('handles objects with complex message types', () => {
    const inputObject = { message: { foo: 'bar' } }
    const result = coerceError(inputObject)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('Unknown error')
    // @ts-ignore
    expect(result.originalMessage).toBe(inputObject.message)
  })

  it('should return a new error with the input value converted to a string if input is not an object nor an instance of Error', () => {
    const inputValue = 'Just a string'
    const result = coerceError(inputValue)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe(String(inputValue))
  })

  it('should return a new error with "Unknown error" message for the input null value', () => {
    const inputValue = null
    const result = coerceError(inputValue)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('Unknown error')
  })

  it('should return a new error with "Unknown error" message for the input undefined value', () => {
    const inputValue = undefined
    const result = coerceError(inputValue)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('Unknown error')
  })
})
