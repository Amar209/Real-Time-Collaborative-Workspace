import Redis from "ioredis";
import { EventEmitter } from "events";

export interface PubSubAdapter {
  publish(channel: string, message: Uint8Array): Promise<void>;
  subscribe(channel: string, callback: (message: Uint8Array) => void): Promise<void>;
  unsubscribe(channel: string): Promise<void>;
}

export class DistributedRedisAdapter implements PubSubAdapter {
  private pubClient: Redis | null = null;
  private subClient: Redis | null = null;
  private memoryEmitter = new EventEmitter();
  private callbacks = new Map<string, (message: Uint8Array) => void>();
  public isRedisConnected = false;

  constructor(redisUrl?: string) {
    if (redisUrl && !redisUrl.includes("offline")) {
      try {
        const pub = new Redis(redisUrl, {
          lazyConnect: true,
          retryStrategy: () => null,
        });
        const sub = new Redis(redisUrl, {
          lazyConnect: true,
          retryStrategy: () => null,
        });

        // Silence unhandled error warnings when local Redis is offline
        pub.on("error", () => {});
        sub.on("error", () => {});

        Promise.all([pub.connect(), sub.connect()])
          .then(() => {
            this.pubClient = pub;
            this.subClient = sub;
            this.isRedisConnected = true;
            console.log("✅ Redis Pub/Sub connected successfully for horizontal scaling.");

            this.subClient.on("messageBuffer", (channelBuffer: Buffer, messageBuffer: Buffer) => {
              const channel = channelBuffer.toString();
              const cb = this.callbacks.get(channel);
              if (cb) {
                cb(new Uint8Array(messageBuffer));
              }
            });
          })
          .catch(() => {
            console.log("ℹ️ Redis not detected locally. Using High-Performance In-Memory Pub/Sub adapter.");
            this.pubClient = null;
            this.subClient = null;
            this.isRedisConnected = false;
          });
      } catch {
        console.log("ℹ️ Using In-Memory Pub/Sub fallback.");
      }
    } else {
      console.log("ℹ️ Redis URL not specified. Running with In-Memory Pub/Sub.");
    }
  }

  async publish(channel: string, message: Uint8Array): Promise<void> {
    if (this.isRedisConnected && this.pubClient) {
      await this.pubClient.publish(channel, Buffer.from(message));
    }
    // Also emit locally
    this.memoryEmitter.emit(channel, message);
  }

  async subscribe(channel: string, callback: (message: Uint8Array) => void): Promise<void> {
    this.callbacks.set(channel, callback);
    if (this.isRedisConnected && this.subClient) {
      await this.subClient.subscribe(channel);
    }
    this.memoryEmitter.on(channel, callback);
  }

  async unsubscribe(channel: string): Promise<void> {
    this.callbacks.delete(channel);
    if (this.isRedisConnected && this.subClient) {
      await this.subClient.unsubscribe(channel);
    }
    this.memoryEmitter.removeAllListeners(channel);
  }
}
