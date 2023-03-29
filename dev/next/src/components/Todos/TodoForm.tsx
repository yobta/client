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

import { addTodo } from './todosStore'

interface TodoFormFC {
  (): JSX.Element
}

const busyStore = createStore(0)

const handleSubmit = asyncYobta(
  formYobta(),
  awaitShapeYobta({
    text: [
      requiredYobta(),
      stringYobta(),
      minCharactersYobta(1),
      maxCharactersYobta(2000),
    ],
  }),
  requiredYobta(),
  validityYobta(),
  awaitSubmitYobta(async (todo) => {
    busyStore.next(Date.now())
    addTodo(todo)
  })
)

export const TodoForm: TodoFormFC = () => {
  const key = useStore(busyStore)
  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex mx-4 shadow-md"
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
      key={key}
    >
      <Input
        autoComplete="off"
        name="text"
        caption="New todo"
        className="rounded-r-none flex-grow yobta-bg-13"
      />
      <button
        className="yobta-button-primary h-12 rounded-l-none shrink-0"
        type="submit"
      >
        <CircleWithPlus /> Add
      </button>
    </form>
  )
}
