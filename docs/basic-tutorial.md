&larr; [Home](../../README.md)

# Observable Store

In this tutorial, we will create a counter store with observableYobta factory, add some actions to it, and subscribe to the store updates.

## Creating Stores

First, we import a store factory and create a store instance.

```ts
import { observableYobta } from '@yobta/stores'

const counterStore = observableYobta(0)
```

## Setting Values

Now we can create actions that change the store value. A store `next` method requires a new store value or a value-creator function that is useful in cases when our next value depends on the last one.

```ts
const reset: VoidFunction = () => {
  counterStore.next(0)
}

const increment: VoidFunction = () => {
  counterStore.next(last => last + 1)
}
```

## Getting Values

We can read store value by calling the store's `last()` method. Stores do not have a history.

```ts
export const getCounterValue = (): number => counterStore.last()
```

If we called the `getCounterValue()` now, the return value would be `0` because we haven't changed the store value yet.

## Subscribing to Updates

To receive the updates pass a subscriber function to the store `subscribe` method. The subscriber will receive every next store value unless we unsubscribe.

```ts
const counterElement = document.getElementById('my-counter')

const unsubscribe = counterStore.subscribe(counterValue => {
  counterElement.innerText = counterValue
})
```

## Unsubscribing

The result of calling the `subscribe` method is always a function that unsubscribes from future store updates.

```ts
unsubscribe()
```

## Putting it Altogether

Now let's [create](./using-with-react.md) a React page with the counter.
