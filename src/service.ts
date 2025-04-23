
import WebSocket, { WebSocketServer } from 'ws';
import { createServer } from 'http';

type ServiceInfo = {
  name: string;
  host: string;
  port: number;
};

type Registry = Map<WebSocket, ServiceInfo>;

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 7885;
const registry: Registry = new Map();

const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const { jsonrpc, method, params, id } = JSON.parse(message.toString());

      if (jsonrpc !== '2.0' || typeof method !== 'string' || !id) {
        return ws.send(JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32600, message: 'Invalid Request' } }));
      }

      if (method === 'register') {
        if (typeof params?.name !== 'string' || typeof params?.host !== 'string' || typeof params?.port !== 'number') {
          return ws.send(JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32602, message: 'Invalid params' } }));
        }
        registry.set(ws, params);
        ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: true }));
      } else if (method === 'list') {
        const services = Array.from(registry.values());
        ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: services }));
      } else if (method === 'lookup') {
        const service = Array.from(registry.values()).find(s => s.name === params?.name) || null;
        ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: service }));
      } else {
        ws.send(JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method '${method}' not found` } }));
      }
    } catch (err) {
      ws.send(JSON.stringify({ jsonrpc: '2.0', error: { code: -32700, message: 'Parse error' } }));
    }
  });

  ws.on('close', () => {
    registry.delete(ws);
  });
});

server.listen(PORT, () => {
  console.log(`Registry WebSocket server listening on port ${PORT}`);
});
