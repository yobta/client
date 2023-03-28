import { createChannel, createCollection } from '@yobta/client'
import { YobtaCollectionId } from '@yobta/protocol'
import { createHookFromStore } from '@yobta/stores/react'

import { pushNotification } from '../Notification/notificationStore'

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

export const useTodos = createHookFromStore(allTodos)

export const deleteTodo = (id: YobtaCollectionId): void => {
  allTodos.delete(id)
  const todo = todos.get(id)
  pushNotification({
    message: `Deleted "${todo?.text}"`,
    callback: () => {
      allTodos.restore(id)
    },
  })
}
export const updateTodo = allTodos.update

export const addTodo = async ({ text }: { text: string }): Promise<void> => {
  await allTodos.insert({
    id: Date.now().toString(),
    text,
    completed: false,
    time: Date.now(),
  })
}
