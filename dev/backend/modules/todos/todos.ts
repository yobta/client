import { createCollection } from '../../../../@yobta/server/src/index.js'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

const todos = createCollection<Todo>({
  name: 'todos',
  async onSubscribe({ headers, operation }) {
    console.log('onSubscribe: todos', { headers, operation })
  },
  async onInsert({ operation }) {
    return [operation]
  },
  async onUpdate({ operation }) {
    return [operation]
  },
  async onDelete({ operation }) {
    return [operation]
  },
})
