import { createCollection } from '../../../../@yobta/server/src/index.js'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

createCollection<Todo>({
  name: 'todos',
  async onSubscribe({ headers, operation }) {
    // eslint-disable-next-line no-console
    console.log('onSubscribe: todos', { headers, operation })
  },
  async onInsert({ operation }) {
    return [operation]
  },
  async onUpdate({ operation }) {
    return [operation]
  },
})
