import { Input } from '@yobta/ui'
import type { NextPage } from 'next'
import Head from 'next/head'
import {
  asyncYobta,
  awaitShapeYobta,
  awaitSubmitYobta,
  formYobta,
  maxCharactersYobta,
  minCharactersYobta,
  requiredYobta,
  stringYobta,
  validityYobta,
} from '@yobta/validator'
import { createStore } from '@yobta/stores'
import { useStore } from '@yobta/stores/react'

import { addTodo, useTodos } from '../stores/todosStore'

const busyStore = createStore(0)

const handleSubmit = asyncYobta(
  formYobta(),
  awaitShapeYobta({
    text: [
      requiredYobta(),
      stringYobta(),
      minCharactersYobta(2),
      maxCharactersYobta(2000),
    ],
  }),
  requiredYobta(),
  awaitSubmitYobta(addTodo),
  validityYobta(),
  awaitSubmitYobta(async () => {
    busyStore.next(Date.now())
  })
)

const Home: NextPage = () => {
  const todos = useTodos()
  const todosArray = Array.from(todos.values())
  const key = useStore(busyStore, {
    getServerSnapshot() {
      return 0
    },
  })
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container max-w-lg mx-auto px-4">
        <h1 className="text-2xl my-4">Todos: {todos.length}</h1>
        {todosArray.map(({ id, text }) => {
          return (
            <div key={id} className="flex items-center justify-between">
              <span>{text}</span>
              <button
                className="bg-red-500 text-white px-2 rounded"
                // onClick={() => todos.delete(id)}
              >
                Delete
              </button>
            </div>
          )
        })}
      </main>
      <footer>
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex"
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
          key={key}
        >
          <Input
            name="text"
            caption="My Todo"
            className="flex-1 rounded-r-none"
          />
          <button className="yobta-primary h-12 rounded-l-none" type="submit">
            Add Todo
          </button>
        </form>
      </footer>
    </>
  )
}

export default Home
