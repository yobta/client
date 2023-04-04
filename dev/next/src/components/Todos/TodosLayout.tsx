import Head from 'next/head'
import Link from 'next/link'
import { Home } from '@yobta/ui'

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
      <Link
        href="/"
        className="sm:fixed top-2 left-2 yobta-button w-12 h-12 p-0"
      >
        <Home />
      </Link>
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
