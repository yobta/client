import { createMemoryLog } from '@yobta/server'

import { createCollection } from '../../../../@yobta/server/src/index.js'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

const log = createMemoryLog()

createCollection<Todo>({
  name: 'todos',
  log,
  async write(message) {
    return [message.operation]
  },
})
