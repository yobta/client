import { createChannel, createCollection } from '@yobta/server'

import { batchSize } from '../../constants.js'
import { pgLog } from '../../log.js'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

const collection = createCollection<Todo>({
  name: 'todo',
  log: pgLog,
})

createChannel({
  route: 'all-todos',
  collection,
  batchSize,
  access: {
    async read() {},
    async write() {},
  },
})
