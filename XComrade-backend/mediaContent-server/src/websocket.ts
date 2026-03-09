/**
 * WebSocket server for real-time messaging and notifications.
 *
 * Clients connect with their JWT as a query param:
 *   ws://localhost:3001?token=<jwt>
 *
 * Supported incoming message types from clients:
 *   { type: "typing", payload: { receiverId, isTyping } }
 *
 * The server can push to connected clients:
 *   { type: "new_message",  payload: chatMessages }
 *   { type: "notification", payload: notifications }
 *   { type: "typing",       payload: { senderId, isTyping } }
 */

import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { URL } from 'url';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

interface AuthenticatedSocket extends WebSocket {
  userId?: number;
  käyttäjäTunnus?: string;
  isAlive?: boolean;
}

// Map userId -→ set of open sockets (a user can have multiple tabs)
const clients = new Map<number, Set<AuthenticatedSocket>>();

/**
 * Send a JSON payload to every socket belonging to `userId`.
 * Silently skips if the user is not connected.
 */
export function sendToUser(userId: number, data: Record<string, unknown>): void {
  const sockets = clients.get(userId);
  if (!sockets) return;

  const json = JSON.stringify(data);
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(json);
    }
  }
}

/**
 * Attach a WebSocket server to an existing HTTP server.
 * Call this once from index.ts after creating the HTTP server.
 */
export function createWebSocketServer(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server });

  // Heartbeat: close dead connections every 30 s
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients as Set<AuthenticatedSocket>) {
      if (ws.isAlive === false) {
        ws.terminate();
        continue;
      }
      ws.isAlive = false;
      ws.ping();
    }
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeat));

  wss.on('connection', (ws: AuthenticatedSocket, req) => {
    //  Authenticate via token query-param
    try {
      const url = new URL(req.url ?? '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Missing token');
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; käyttäjäTunnus: string };
      ws.userId = decoded.id;
      ws.käyttäjäTunnus = decoded.käyttäjäTunnus;
    } catch {
      ws.close(4003, 'Invalid token');
      return;
    }

    //  Register the socket
    ws.isAlive = true;

    if (!clients.has(ws.userId!)) {
      clients.set(ws.userId!, new Set());
    }
    clients.get(ws.userId!)!.add(ws);

    console.log(`🔌 WS connected: user ${ws.userId} (${ws.käyttäjäTunnus})`);

    //  Heartbeat pong
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    //  Handle incoming messages from the client
    ws.on('message', (raw) => {
      try {
        const data = JSON.parse(raw.toString());

        if (data.type === 'typing') {
          const { receiverId, isTyping } = data.payload as { receiverId: number; isTyping: boolean };
          sendToUser(receiverId, {
            type: 'typing',
            payload: { senderId: ws.userId, isTyping },
          });
        }
      } catch (err) {
        console.error('WS message parse error:', err);
      }
    });

    //  Cleanup on close
    ws.on('close', () => {
      const set = clients.get(ws.userId!);
      if (set) {
        set.delete(ws);
        if (set.size === 0) clients.delete(ws.userId!);
      }
      console.log(`🔌 WS disconnected: user ${ws.userId} (${ws.käyttäjäTunnus})`);
    });
  });

  console.log('🔌 WebSocket server attached');
  return wss;
}
