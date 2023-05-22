import { pause } from './index.js'

const mock = vi.fn()

vi.stubGlobal('setTimeout', mock)

it('should call setTimeout with correct timeout', () => {
  pause(16)
  expect(mock).toHaveBeenCalledTimes(1)
  expect(mock).toHaveBeenCalledWith(expect.any(Function), 16)
})

it('should resolve after the specified timeout', () => {
  const promise = pause(16)
  mock.mock.calls[0][0]()
  expect(promise).resolves.toBeUndefined()
})
