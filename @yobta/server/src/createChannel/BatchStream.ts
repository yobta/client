import { Transform, TransformCallback } from 'stream'

export class BatchStream<Item> extends Transform {
  private batch: Item[]
  private readonly batchSize: number

  constructor(batchSize: number) {
    super({ objectMode: true })
    this.batchSize = batchSize
    this.batch = []
  }

  _transform(chunk: Item, encoding: string, callback: TransformCallback): void {
    this.batch.push(chunk)
    if (this.batch.length === this.batchSize) {
      this.push(this.batch)
      this.batch = []
    }
    callback()
  }

  _flush(callback: TransformCallback): void {
    if (this.batch.length > 0) {
      this.push(this.batch)
    }
    callback()
  }
}
