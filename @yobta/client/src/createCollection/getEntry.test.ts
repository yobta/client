import { getEntry } from './getEntry.js'

it('should create item if it does not exist', () => {
  const mockState = {}
  const item = getEntry(mockState, 'item-1')
  expect(item).toEqual([{ id: 'item-1' }, { id: 0 }])
})
it('should get item if it exists', () => {
  const entries: any = [{ id: 'item-1' }, { id: 0 }]
  const item = getEntry(entries, 'item-1')
  expect(item).toEqual([{ id: 'item-1' }, { id: 0 }])
})
