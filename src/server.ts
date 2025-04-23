import * as path from 'path';
import * as dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { connectMongo } from './db/mongo';
import { dispatchRpc } from './rpc/dispatcher';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = parseInt(process.env.PORT || '8080', 10);
const SERVICE_NAME = process.env.SERVICE_ID || 'unknown-service';

export function startServer({
  onMessage,
}: {
  onMessage: (message: any, ws: WebSocket) => void;
}) {
  const server = createServer();
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    const clientId = uuidv4();
    console.log(`🔗 Client connected: ${clientId}`);

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const response = await onMessage(message, ws);
        if (response) ws.send(JSON.stringify(response));
      } catch (err: any) {
        console.error('❌ Failed to handle message:', err.message || err);

        const errorCode = err instanceof SyntaxError ? -32700 : -32603;
        const messageText = err instanceof SyntaxError
          ? 'Parse error'
          : 'Internal error';

        ws.send(JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: errorCode,
            message: messageText,
          },
          id: null,
        }));
      }
    });
  });

  server.listen(PORT, () => {
    console.log(`🔌 WebSocket server listening on ws://localhost:${PORT}`);
    console.log(`🎯 ${SERVICE_NAME} Service Ready`);
  });

  return { server, wss };
}

async function main() {
  const mongoConnected = await connectMongo();
  if (!mongoConnected) {
    console.error('❌ MongoDB connection failed. Service cannot start.');
    process.exit(1);
  }

  startServer({
    onMessage: dispatchRpc,
  });
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('❌ Error during startup:', message);
  process.exit(1);
});
