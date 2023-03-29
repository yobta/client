# Readme

This work-in-progress monorepo contains a set of libraries for creating realtime APIs with offline support and eventual consistency of data. The components presented here are subject to change as more features are implemented in the future.

## Client

### Creating WS connection

```ts
import { createClient, createWsTransport } from '@yobta/client'
import { createConnectivityStore } from '@yobta/stores'
import { useEffect } from 'react'

const connect = createClient({
  logger: console,
  internetObserver: createConnectivityStore(),
  getHeaders() {
    return {}
  },
  transport: createWsTransport({ url: 'wss://bill.microsoft.com/' }),
})

export const useClient = (): void => {
  useEffect(connect, [])
}
```

### Collections

A client collection is an observable store holding data snapshots and allowing `commit` and `merge` data operations. It is not meant for direct usage, but is required for channels.

When an operation is committed to a collection, the client sends it to the server. The server can either `merge` or `reject` the committed operation.

If the operation is rejected, the collection removes the operation and reverts the snapshot to the previous version.

When the server merges operations, it sends the same or a modified operation to the subscribed clients. The modified operation may have a different committed time if the client time is greater than the server time, or it may be missing some data fields if the server has merged newer updates. The collection removes the committed operation and merges the update to the snapshot. Merged operations cannot be reverted, only overwritten by a new operation.

Commit supports `insert` and `update` operations. The `insert` operation includes all snapshot keys, including the required `id`. The `update` operation can have any optional number of snapshot keys, excluding the id.

Deleting keys is not intended; instead, set them to `null` or `undefined` when needed.

Merge supports `insert`, `update`, and `revalidate` operations. The `revalidate` operation is a combination of `insert` and `update`. Instead of a key/value data object, it contains an entries array with information about all recent changes that were merged to the snapshot. An entry example: `[key, value, committed, merged]`.

```ts
import { createCollection } from '@yobta/client'

const collection = createCollection<Todo>([])
```

### Channels

Channels are observable stores that help organize snapshots meaningfully and protect them from unauthorized access.

Channels support `publish`, `update`, `move`, `delete`, `restore`, and `revalidate` operations, which are committed on the client and merged on the server.

```ts
const myTodos = createChannel({
  collection,
  route: `/todos/${userId}`,
})

const ourTodos = createChannel({
  collection,
  route: `/todos/${organisationId}`,
})
```

#### Publishing

The same data snapshot can be published to multiple channels. If the optional `nextSnapshotId` argument is not provided, the snapshot will be appended to the end of the channel.

Publishing can be thought of as linking in relational databases.

```ts
const nextSnapshotId = 'todo-1'
const snapshot = await myTodos.publish(
  {
    id: 'todo-2',
    text: 'More docs',
    completed: false,
  },
  nextSnapshotId,
)
```

#### Updating

Updates are applied to the snapshot. All channels where the snapshot was added will receive the update (work in progress).

```ts
const snapshot = await channel.update('todo-2', { completed: true })
```

#### Sorting

The `move` operation applies only to one channel, meaning that all channels have independent sorts.

In the following example, the `move` method will take the first snapshot in the todos array and place it before the 7th snapshot. The `move` method can be used with the channel stores as well as with derived channel stores.

```ts
const todos = useTodos()
const from = 0 // current position
const to = 6 // next position

await channel.move(todos, from, to)
```

#### Deleting

The `delete` operation applies only to one channel. After deletion, the snapshot can be inserted again.

```ts
const snapshot = await channel.delete('todo-1')
```

#### Restoring

The `restore` operations applied only to one channel.

```ts
const snapshot = await channel.restore('todo-1')
```

## Server

pending
