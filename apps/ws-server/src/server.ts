import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
// @ts-expect-error y-websocket/bin/utils lacks direct typescript types
import { setupWSConnection, setPersistence, getYDoc } from "y-websocket/bin/utils";
import dotenv from "dotenv";
import { DistributedRedisAdapter } from "./redis-adapter.js";
import fs from "fs";
import path from "path";

dotenv.config();

const PORT = parseInt(process.env.PORT || "1234", 10);
const HOST = process.env.HOST || "0.0.0.0";
const REDIS_URL = process.env.REDIS_URL;

// Setup local storage directory for fast persistent document caching
const STORAGE_DIR = path.resolve(process.cwd(), "data", "yjs-storage");
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const redisAdapter = new DistributedRedisAdapter(REDIS_URL);

// Configure Yjs Persistence with debounced disk persistence & database sync
setPersistence({
  bindState: async (docName: string, ydoc: Y.Doc) => {
    const filePath = path.join(STORAGE_DIR, `${docName}.bin`);
    if (fs.existsSync(filePath)) {
      try {
        const persistedData = fs.readFileSync(filePath);
        Y.applyUpdate(ydoc, new Uint8Array(persistedData));
        console.log(`[Persistence] Loaded state for doc: ${docName} (${persistedData.length} bytes)`);
      } catch (err) {
        console.error(`[Persistence] Failed to load ${docName}:`, err);
      }
    }

    // Subscribe to Redis Pub/Sub for cross-server synchronization
    const channel = `yjs:room:${docName}`;
    await redisAdapter.subscribe(channel, (update: Uint8Array) => {
      Y.applyUpdate(ydoc, update, "redis");
    });

    // Listen for local updates to broadcast to Redis & persist
    let debounceTimer: NodeJS.Timeout | null = null;
    ydoc.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin !== "redis") {
        redisAdapter.publish(channel, update);
      }

      // Debounce disk persistence every 2 seconds
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          const state = Y.encodeStateAsUpdate(ydoc);
          fs.writeFileSync(filePath, Buffer.from(state));
        } catch (err) {
          console.error(`[Persistence] Failed to save ${docName}:`, err);
        }
      }, 2000);
    });
  },
  writeState: async (docName: string, ydoc: Y.Doc) => {
    const filePath = path.join(STORAGE_DIR, `${docName}.bin`);
    try {
      const state = Y.encodeStateAsUpdate(ydoc);
      fs.writeFileSync(filePath, Buffer.from(state));
      console.log(`[Persistence] Flushed snapshot for ${docName} (${state.length} bytes)`);
    } catch (err) {
      console.error(`[Persistence] Failed to write state for ${docName}:`, err);
    }
  },
});

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(
    JSON.stringify({
      status: "online",
      service: "Real-Time Collaborative WebSocket Server (Yjs)",
      redisConnected: redisAdapter.isRedisConnected,
      timestamp: new Date().toISOString(),
    })
  );
});

const wss = new WebSocketServer({ server });

wss.on("connection", (conn: WebSocket, req: http.IncomingMessage) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const docName = url.pathname.replace(/^\//, "") || url.searchParams.get("room") || "default-doc";

  console.log(`[WS] Client connected to room: ${docName}`);

  // Setup Yjs WebSocket Connection with awareness
  setupWSConnection(conn, req, {
    docName,
    gc: true,
  });

  conn.on("close", () => {
    console.log(`[WS] Client disconnected from room: ${docName}`);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`🚀 Collaborative WebSocket Server running on ws://${HOST}:${PORT}`);
  console.log(`📡 Healthcheck available at http://${HOST}:${PORT}`);
});
