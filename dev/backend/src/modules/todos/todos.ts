import { createChannel, createCollection } from '@yobta/server'

import { log } from '../../log.js'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

const collection = createCollection<Todo>({
  name: 'todos',
  log,
})

createChannel({
  route: 'all-todos',
  collection,
  access: {
    async read() {},
    async write() {},
  },
})
