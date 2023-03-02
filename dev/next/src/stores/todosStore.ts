import { createChannel, createCollection } from '@yobta/client'
import { createHookFromStore } from '@yobta/stores/react'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

const todos = createCollection<Todo>([])

const myTodos = createChannel({
  collection: todos,
  route: 'my-todos',
})

export const useTodos = createHookFromStore(myTodos, {
  getServerSnapshot: () => [],
})
