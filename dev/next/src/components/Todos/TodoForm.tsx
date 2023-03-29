import { createStore } from '@yobta/stores'
import { useStore } from '@yobta/stores/react'
import { CircleWithPlus, Input } from '@yobta/ui'
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

import { usePathnameStore } from './pathnameStore'
import { addTodo } from './todosStore'

interface TodoFormFC {
  (): JSX.Element
}

const busyStore = createStore(0)

const handleSubmit = asyncYobta(
  formYobta(),
  awaitShapeYobta({
    text: [
      requiredYobta("Can't be empty"),
      stringYobta(),
      minCharactersYobta(1),
      maxCharactersYobta(2000),
    ],
  }),
  requiredYobta(),
  validityYobta(),
  awaitSubmitYobta(async (todo) => {
    busyStore.next(busyStore.last() + 1)
    addTodo(todo)
  })
)

export const TodoForm: TodoFormFC = () => {
  const key = useStore(busyStore)
  const pathname = usePathnameStore()
  const disabled = pathname === '/completed'
  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex mx-4 shadow-md"
      key={key}
    >
      <Input
        autoComplete="off"
        name="text"
        caption="New todo"
        className="rounded-r-none flex-grow yobta-bg-13"
        disabled={disabled}
      />
      <button
        className="yobta-button-primary h-12 rounded-l-none shrink-0"
        disabled={disabled}
        type="submit"
      >
        <CircleWithPlus /> Add
      </button>
    </form>
  )
}
