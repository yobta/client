import { Button, Toggle, Tooltip, Trash } from '@yobta/ui'
import clsx from 'clsx'
import { Container, Draggable } from 'react-smooth-dnd'

import { deleteTodo, moveTodo, updateTodo, useTodos } from './todosStore'

interface TodoListFC {
  (): JSX.Element
}

export const TodoList: TodoListFC = () => {
  const todos = useTodos()

  return (
    <>
      {todos.length === 0 && (
        <div className="yobta-bg-paper-2 p-4 rounded">No todos</div>
      )}
      {/* @ts-ignore */}
      <Container
        // groupName="todo-group"
        onDrop={({ removedIndex, addedIndex }) => {
          moveTodo(todos, removedIndex, addedIndex)
        }}
        // getChildPayload={(index) => todos[index]}
      >
        {todos.map(({ id, text }) => (
          // @ts-ignore
          <Draggable
            key={`${id}-${text}`}
            className="mb-1 focus-within:ring-2 rounded"
          >
            <div className={clsx('yobta-list-item yobta-bg-paper-2 ', '')}>
              <input
                className="appearance-none w-full bg-transparent outline-none"
                defaultValue={text}
                onBlur={(event) => {
                  const { value } = event.target
                  updateTodo(id, { text: value.trim() })
                }}
              />
              <Toggle>
                <Button
                  className="rounded-full p-0 w-8 h-8"
                  onClick={() => {
                    deleteTodo(id)
                  }}
                >
                  <Trash />
                </Button>
                <Tooltip id={`delete-${id}`}>Delete Todo</Tooltip>
              </Toggle>
            </div>
          </Draggable>
        ))}
      </Container>
    </>
  )
}
