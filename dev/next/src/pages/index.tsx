import { ChevronSmallRight } from '@yobta/ui'
import type { NextPage } from 'next'
import Link from 'next/link'

const Home: NextPage = () => {
  return (
    <main className="yobta-bg-paper-2 max-w-sm mx-4 sm:mx-auto my-4 yobta-menu">
      <h1 className="yobta-menu-header">Home</h1>
      <Link href="/todos" legacyBehavior>
        <a className="yobta-menu-item">
          <span>Todo App</span>
          <ChevronSmallRight />
        </a>
      </Link>
    </main>
  )
}

export default Home
