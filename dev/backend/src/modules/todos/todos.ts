import { createChannel, createCollection } from '@yobta/server'

import { log } from '../../log.js'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

const todos = createCollection<Todo>({
  name: 'todos',
  log,
  async write(message) {
    return [message.operation]
  },
})

createChannel({
  route: 'all-todos',
  collection: todos,
  access: {
    async read() {},
    async write() {},
  },
})
