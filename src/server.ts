import WebSocket, { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 7887 });

interface JSONRPCRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id?: number;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
  };
  id?: number;
}

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    let request: JSONRPCRequest;
    try {
      request = JSON.parse(message.toString());
    } catch (e) {
      const errorResponse: JSONRPCResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
        },
        id: undefined, // <-- FIXED HERE
      };
      ws.send(JSON.stringify(errorResponse));
      return;
    }

    const response: JSONRPCResponse = {
      jsonrpc: '2.0',
      id: request.id,
    };

    if (request.method === 'ping') {
      response.result = 'pong';
    } else {
      response.error = {
        code: -32601,
        message: `Method '${request.method}' not found in service 'aimsif_service_discovery'`,
      };
    }

    ws.send(JSON.stringify(response));
  });
});

console.log('WebSocket server is running on ws://127.0.0.1:7887');
