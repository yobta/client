&larr; [Home](../../README.md)

# Overloads

Overloads are usefull for sending metadate to the plugins. Let's improve our [tracing plugin](./store-plugins.md) by adding some metdata.

###### counterStore.ts

```ts
const tracePlugin: StorePlugin<number> = (
  { type, last },
  meta?: { action: string },
) => {
  if (meta?.action === 'increment') {
    console.log(type, last())
  }
}

const counterStore = observableYobta(0, tracePlugin)

const increment = (): void => {
  counterStore.next(last => last + 1, { action: 'increment' })
}
const decrement = (): void => {
  counterStore.next(last => last - 1, { action: 'decrement' })
}

export const useCounter = (): number => useObservable(counterStore)
```

###### counterPage.tsx

```tsx
import { useCounter, decrement, increment } from './counterStore'

export const Page = (): JSX.Element => {
  const counter = useCounter()
  return (
    <>
      state: {counter}
      <hr />
      <button onClick={decrement}>Decrement</button>|
      <button onClick={increment}>Increment</button>
    </>
  )
}
```
