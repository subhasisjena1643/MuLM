import { DataContract, StreamConfig } from '../types/ExecutionTypes';

export class StreamingEngine {
  private streams = new Map<string, DataStream>();
  private buffers = new Map<string, StreamBuffer>();

  constructor() {
    console.log('🌊 Streaming Engine initialized');
  }

  createStream(
    streamId: string,
    sourceNodeId: string,
    targetNodeId: string,
    dataContract: DataContract,
    config: StreamConfig
  ): void {
    console.log(`📡 Creating data stream: ${streamId}`);
    
    const stream = new DataStream(streamId, sourceNodeId, targetNodeId, dataContract, config);
    this.streams.set(streamId, stream);
    
    const buffer = new StreamBuffer(config.bufferSize);
    this.buffers.set(streamId, buffer);
  }

  async writeToStream(streamId: string, data: any): Promise<void> {
    const stream = this.streams.get(streamId);
    const buffer = this.buffers.get(streamId);
    
    if (!stream || !buffer) {
      throw new Error(`Stream not found: ${streamId}`);
    }

    // Validate data against contract
    this.validateData(data, stream.dataContract);
    
    // Serialize data
    const serializedData = this.serializeData(data, stream.dataContract);
    
    // Write to buffer
    await buffer.write(serializedData);
    
    // Check if buffer should be flushed
    if (buffer.shouldFlush(stream.config.flushInterval)) {
      await this.flushBuffer(streamId);
    }
  }

  async readFromStream(streamId: string): Promise<any> {
    const buffer = this.buffers.get(streamId);
    if (!buffer) {
      throw new Error(`Stream not found: ${streamId}`);
    }

    return await buffer.read();
  }

  async flushBuffer(streamId: string): Promise<void> {
    const buffer = this.buffers.get(streamId);
    if (buffer) {
      await buffer.flush();
    }
  }

  closeStream(streamId: string): void {
    console.log(`📴 Closing stream: ${streamId}`);
    
    this.streams.delete(streamId);
    this.buffers.delete(streamId);
  }

  private validateData(data: any, contract: DataContract): void {
    // Basic validation - could be extended
    if (contract.type === 'text' && typeof data !== 'string') {
      throw new Error(`Data type mismatch: expected text, got ${typeof data}`);
    }
    
    // Add more validation rules as needed
  }

  private serializeData(data: any, contract: DataContract): Uint8Array {
    const config = contract.serialization;
    
    switch (config.format) {
      case 'json':
        return new TextEncoder().encode(JSON.stringify(data));
      case 'msgpack':
        // Would use msgpack serialization
        return new TextEncoder().encode(JSON.stringify(data));
      default:
        return new TextEncoder().encode(JSON.stringify(data));
    }
  }
}

class DataStream {
  constructor(
    public id: string,
    public sourceNodeId: string,
    public targetNodeId: string,
    public dataContract: DataContract,
    public config: StreamConfig
  ) {}
}

class StreamBuffer {
  private buffer: Uint8Array[] = [];
  private totalSize = 0;
  private lastFlush = Date.now();

  constructor(private maxSize: number) {}

  async write(data: Uint8Array): Promise<void> {
    this.buffer.push(data);
    this.totalSize += data.length;
    
    // Handle backpressure
    if (this.totalSize > this.maxSize) {
      await this.flush();
    }
  }

  async read(): Promise<Uint8Array | null> {
    if (this.buffer.length === 0) {
      return null;
    }
    
    const data = this.buffer.shift()!;
    this.totalSize -= data.length;
    return data;
  }

  async flush(): Promise<void> {
    // In a real implementation, this would write to the target
    console.log(`💧 Flushing buffer: ${this.buffer.length} items, ${this.totalSize} bytes`);
    
    this.buffer = [];
    this.totalSize = 0;
    this.lastFlush = Date.now();
  }

  shouldFlush(flushInterval: number): boolean {
    return Date.now() - this.lastFlush > flushInterval;
  }
}
