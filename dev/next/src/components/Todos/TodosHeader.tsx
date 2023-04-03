import clsx from 'clsx'
import Link from 'next/link'

import { usePathnameStore } from './pathnameStore'
import { useTodos } from './todosStore'

const options = [
  { label: 'All', value: '/todos' },
  { label: 'Pending', value: '/todos/pending' },
  { label: 'Completed', value: '/todos/completed' },
]

export const TodosHeader = (): JSX.Element => {
  const pathname = usePathnameStore()
  const todos = useTodos()
  return (
    <header className="my-4 px-4 flex items-center justify-between">
      <h1 className="text-2xl">
        Todos <sup>{todos.length}</sup>
      </h1>
      <nav className="flex">
        {options.map(({ label, value }, index) => (
          <Link href={value} legacyBehavior key={value}>
            <a
              className={clsx(
                'rounded-none text-xs h-8',
                index === 0 && 'rounded-l-full',
                index === options.length - 1 && 'rounded-r-full',
                pathname === value
                  ? 'yobta-button-primary'
                  : 'yobta-button-paper-2'
              )}
            >
              {label}
            </a>
          </Link>
        ))}
      </nav>
    </header>
  )
}
