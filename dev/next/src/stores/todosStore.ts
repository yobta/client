import { createChannel, createCollection } from '@yobta/client'
import { createHookFromStore } from '@yobta/stores/react'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

const todos = createCollection<Todo>([])

const allTodos = createChannel({
  collection: todos,
  route: 'all-todos',
})

export const useTodos = createHookFromStore(allTodos, {
  getServerSnapshot: () => [],
})

export const addTodo = async ({ text }: { text: string }): Promise<void> => {
  await allTodos.insert({
    id: Date.now().toString(),
    text,
    completed: false,
    time: Date.now(),
  })
}
