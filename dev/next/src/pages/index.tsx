import type { NextPage } from 'next'
import Head from 'next/head'

import { useTodos } from '../components/Todos/todosStore'
import { TodoList } from '../components/Todos/TodoList'
import { TodoForm } from '../components/Todos/TodoForm'
import { ClientStatus } from '../components/ClientStatus/ClientStatus'

const Home: NextPage = () => {
  const todos = useTodos()
  return (
    <>
      <Head>
        <title>Todo App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container max-w-lg mx-auto px-4 min-h-screen">
        <section>
          <h1 className="text-2xl my-4 px-4">Todos: {todos.length}</h1>
          <TodoList />
          <ClientStatus />
        </section>
        <footer className="max-w-lg mx-auto fixed bottom-4 w-full -ml-4">
          <TodoForm />
        </footer>
      </main>
    </>
  )
}

export default Home
