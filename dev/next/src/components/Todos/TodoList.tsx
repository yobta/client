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
        dragClass="select-none yobta-selected rounded"
        lockAxis="y"
        onDrop={({ removedIndex, addedIndex }) => {
          moveTodo(todos, removedIndex, addedIndex)
        }}
      >
        {todos.map(({ id, text, completed }) => (
          // @ts-ignore
          <Draggable
            key={`${id}-${text}`}
            className="mb-1 focus-within:ring-2 yobta-bg-paper-2 rounded"
          >
            <div className="flex items-center gap-x-2">
              <Toggle>
                <label className="flex items-center justify-center w-14 h-14 yobta-button shrink-0 cursor-pointer">
                  <input
                    checked={completed}
                    className={clsx(
                      'yobta-checkbox',
                      completed && 'yobta-ink-info'
                    )}
                    onChange={() => {
                      updateTodo(id, { completed: !completed })
                    }}
                    type="checkbox"
                  />
                </label>
                <Tooltip id={`toggle-${id}`} preferredPlacement="left">
                  {`Mark as ${completed ? 'in' : ''}complete`}
                </Tooltip>
              </Toggle>
              <input
                className="appearance-none flex-1 h-14 bg-transparent outline-none truncate"
                readOnly={completed}
                defaultValue={text}
                onBlur={(event) => {
                  const { value } = event.target
                  updateTodo(id, { text: value.trim() })
                }}
              />
              <Toggle>
                <Button
                  className="p-0 w-14 h-14 rounded-l-none shrink-0"
                  onClick={() => {
                    deleteTodo(id)
                  }}
                >
                  <Trash />
                </Button>
                <Tooltip id={`delete-${id}`} preferredPlacement="right">
                  Delete Todo
                </Tooltip>
              </Toggle>
            </div>
          </Draggable>
        ))}
      </Container>
    </>
  )
}
