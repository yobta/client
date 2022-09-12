&larr; [Home](../../README.md)

# Using with React

To get clean and testable code we separate stores and react tempates.

###### counterStore.ts

```ts
import { observableYobta } from '@yobta/stores'
import { useObservable } from '@yobta/stores/react'

const counterStore = observableYobta(0)

const reset: VoidFunction = () => {
  counterStore.next(0)
}

const increment: VoidFunction = () => {
  counterStore.next(last => last + 1)
}

export const useCounter = (): number => useObservable(counterStore)
```

###### counterPage.tsx

```tsx
import { useCounter, reset, increment } from './counterStore'

export const Page = (): JSX.Element => {
  const counter = useCounter()
  return (
    <>
      Counter: {counter}
      <hr />
      <button onClick={increment}>Next</button>|
      <button onClick={reset}>Reset</button>
    </>
  )
}
```
