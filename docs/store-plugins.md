&larr; [Home](../../README.md)

# Store Plugins

Plugins are the functions that can listen to store lifecycle events and read and modify store states. You can add any number of plugins to the stores.

A store emits the following types of events to the plugins:

- **INIT** — before a store adds the first observer
- **READY** — after a store adds the first observer
- **NEXT** — on every store update
- **IDLE** — when a store removes the last observer

Each type of store events has `initialState` reference and `next()` and `last()` methods.

## Plugin Interface

```ts
interface StorePlugin<State> {
  (event: {
    initialState: State
    last(): State
    next(action: State | ((last: State) => State), ...args: any[]): void
    type: 'INIT' | 'READY' | 'IDLE' | 'NEXT'
  }): void
}
```

## Creating Plugins

Let's create a plugin that traces the store events to the console.

###### counterStore.ts

```ts
import { observableYobta, StorePlugin } from '@yobta/stores'
import { useObservable } from '@yobta/stores/react'

const tracePlugin: StorePlugin<number> = ({ type, last }) => {
  console.log(type, last())
}

const counterStore = observableYobta(0, tracePlugin)

const increment = (): void => {
  counterStore.next(last => last + 1)
}

export const useCounter = (): number => useObservable(counterStore)
```

###### CounterPage.tsx

```tsx
import { useCounter, increment } from './counterStore'

export const Page = (): JSX.Element => {
  const counter = useCounter()
  return (
    <>
      state: {counter}
      <hr />
      <button onClick={increment}>Increment</button>
    </>
  )
}
```
