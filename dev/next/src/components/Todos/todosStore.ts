import {
  createChannel,
  createCollection,
  createIndexedDbStore,
  // createMemoryStore,
} from '@yobta/client'
import { YobtaCollectionId } from '@yobta/protocol'
import { createDerivedStore } from '@yobta/stores'
import { createHookFromStore } from '@yobta/stores/react'

import { pushNotification } from '../Notification/notificationStore'
import { pathnameStore } from './pathnameStore'

type Todo = {
  id: string
  text: string
  completed: boolean
  time: number
}

const store = createIndexedDbStore<Todo>('todos', 1)
// const store = createMemoryStore<Todo>('todos')

const collection = createCollection(store)

const allTodos = createChannel({
  collection,
  path: 'all-todos',
})

const derivedTodos = createDerivedStore(
  (todos, pathname) => {
    switch (pathname) {
      case '/todos/pending':
        return todos.filter((todo) => !todo.completed)
      case '/todos/completed':
        return todos.filter((todo) => todo.completed)
      default:
        return todos
    }
  },
  allTodos,
  pathnameStore
)

export const useTodos = createHookFromStore(derivedTodos)

export const deleteTodo = (id: YobtaCollectionId): void => {
  allTodos.delete(id)
  const todo = collection.get(id)
  pushNotification({
    message: `Deleted: "${todo?.text}"`,
    action: {
      label: 'Undo',
      callback: () => {
        allTodos.restore(id)
      },
    },
  })
}
export const updateTodo = allTodos.update
export const moveTodo = allTodos.move

export const addTodo = async ({ text }: { text: string }): Promise<void> => {
  await allTodos.publish({
    id: Date.now().toString(),
    text,
    completed: false,
    time: Date.now(),
  })
}
