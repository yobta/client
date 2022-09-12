# Yobta/client

## Online

```
const internetConnection: Observable<boolean> = internetConnectionYobta()
```

## Transport

```
const transport: Observable = websocketYobta({
  protocol?: String | String[]
  url: String
})
```

Message types in: STATUS (CLOSE, OPEN, ERROR), MESSAGE
Message types out: CONNECT, DISCONNECT, RESCONNECT, SEND_MESSAGE

## Crosstab

```
const crosstab: Observable = crosstabYobta({
  transport: Observable
})
```

## Encoder

```
const encoder: Observable = encoderYobta({
  encode(): string
  decode(): AnyMessage
})
```

## Client

```
const client = new clientYobta({
  messageHeaders(): Record<string, string>
  encoder,
  transport: crosstab,
})
```
