// src/server.ts
import { WebSocketServer, WebSocket } from 'ws';
import { parse } from 'url';
import * as dotenv from 'dotenv';
import { handleQueueing, handleJsonRpc } from './core';
import { plugin } from './plugin';

dotenv.config();

const PORT = parseInt(process.env.PORT || '7887', 10);
const serviceName = process.env.SERVICE_NAME || 'aimsif_service_discovery';

const wss = new WebSocketServer({ port: PORT });

const connections = new Map<WebSocket, { service?: string }>();

function log(...args: any[]) {
  console.log(`[${serviceName}]`, ...args);
}

wss.on('connection', async (ws, req) => {
  log('Client connected');

  connections.set(ws, {});

  ws.on('message', async (message) => {
    try {
      const msgStr = message.toString();
      let msg;
      try {
        msg = JSON.parse(msgStr);
      } catch (e) {
        ws.send(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' }, id: null }));
        return;
      }

      if (msg.method === 'ping') {
        ws.send(JSON.stringify({ jsonrpc: '2.0', result: 'pong', id: msg.id }));
        return;
      }

      await handleQueueing(ws, msg);
      await handleJsonRpc(ws, msg, serviceName);
    } catch (err) {
      log('Error handling message:', err);
    }
  });

  ws.on('close', () => {
    log('Client disconnected');
    connections.delete(ws);
  });

  ws.on('error', (err) => {
    log('WebSocket error:', err);
  });
});

wss.on('listening', () => {
  log(`WebSocket server started on ws://localhost:${PORT}`);
});

wss.on('error', (err) => {
  log('Server failed to start:', err);
});

(async () => {
  try {
    if (plugin) {
      await plugin(wss, connections);
    }
  } catch (e) {
    log('Plugin initialization failed:', e);
  }
})();
