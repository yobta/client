&larr; [Home](../../../README.md)

# createRouter Utility

Creates a router object to subscribe to events by routes with dynamic parameters

## Example

```js
import { createRouter } from '@yobta/stores'

const router = createRouter()
const unsubscribe = router.subscribe(
  'user/:id',
  (params, data, ...overloads) => {
    console.log(params, data, overloads)
    // Output: { id: '123' }, 'someData', ['overload1', 'overload2']
  },
)

router.publish('user/123', 'someData', 'overload1', 'overload2')

unsubscribe()
```

In this example, we first imported the utility. Then we created an instance of the router and subscribed to events by user /: id route.
After that, we published the event with the payload someData (can be any data) and additional arguments (overloads).
In the console, we got the output of the received arguments.

## Typing of route parameters and payload

```ts
type Data = {
  foo: string
}
type Overloads = string[]

const router = createRouter<Data, Overloads>()
const unsubscribe = router.subscribe(
  'user/:id/:name?',
  (params, data, ...overloads) => {
    // params type - { id: string; name?: string }
    console.log(params, data, overloads)
    // Output: { id: '123', name: '' }, { foo: 'foovalue' } ['overload1', 'overload2']
  },
)

router.publish('user/123', { foo: 'foovalue' }, 'overload1', 'overload2')
unsubscribe()
```

This example shows the possibility of typing payload data and additional parameters. Typing of route parameters occurs automatically.

More examples of using the router can be found [in the tests](./index.test.ts)
