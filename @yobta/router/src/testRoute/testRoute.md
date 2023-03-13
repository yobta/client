&larr; [Home](../../../README.md)

# matchRoute Utility

Checks whether the path matches the route

## Example

```js
import { matchRoute } from '@yobta/stores'

matchRoute('/user/:id', '/user/123') // true
matchRoute('/user/:id', '/nouser/123') // false
```
