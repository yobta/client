export const chunkBySize = <Item>(
  operations: Item[],
  chunkSize: number,
): Item[][] => {
  const chunks = []
  let currentChunk = []
  let currentSize = 0
  for (const operation of operations) {
    const operationSize = Buffer.byteLength(JSON.stringify(operation))
    if (currentSize + operationSize > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk)
        currentChunk = []
        currentSize = 0
      }
      if (operationSize > chunkSize) {
        chunks.push([operation])
      } else {
        currentChunk.push(operation)
        currentSize += operationSize
      }
    } else {
      currentChunk.push(operation)
      currentSize += operationSize
    }
  }
  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }
  return chunks
}
