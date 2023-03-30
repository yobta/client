import { coerceError } from './index.js'

describe('parseUnknownError', () => {
  it('should return the same error if input is an instance of Error', () => {
    const inputError = new Error('Sample error')
    const result = coerceError(inputError)
    expect(result).toBe(inputError)
  })

  it('should return a new error with the same message if input is an object with a message property', () => {
    const inputObject = { message: 'Object error message' }
    const result = coerceError(inputObject)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe(inputObject.message)
  })

  it('should return a new error with the input object converted to a string if input is an object without a message property', () => {
    const inputObject = { foo: 'bar' }
    const result = coerceError(inputObject)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe(String(inputObject))
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
