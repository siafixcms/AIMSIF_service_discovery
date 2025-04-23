import dotenv from 'dotenv';
import { createServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import plugin from './plugin';

dotenv.config();

const PORT = parseInt(process.env.PORT || '7887', 10);
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      plugin.onMessage?.(message, ws);
    } catch (err) {
      const errorResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
        },
        id: null,
      };
      ws.send(JSON.stringify(errorResponse));
    }
  });

  ws.on('close', () => {
    plugin.onClose?.(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server running on ws://localhost:${PORT}`);
});
