import { lwwCollection } from '@yobta/client'
import { createHookFromStore } from '@yobta/stores/react'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

const todos = lwwCollection<Todo>({ channel: 'todos' })

export const useTodos = createHookFromStore(todos)
