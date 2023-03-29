import Head from 'next/head'

import { TodoList } from './TodoList'
import { TodoForm } from './TodoForm'
import { ClientStatus } from '../ClientStatus/ClientStatus'
import { TodosHeader } from './TodosHeader'

export const TodosLayout = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>Todo App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="container max-w-lg mx-auto px-4 min-h-screen">
        <section className="pb-24">
          <TodosHeader />
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
