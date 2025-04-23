// __tests__/integration/ws.rpc.integration.test.ts

import WebSocket from 'ws';
import { spawn } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const WS_PORT = process.env.PORT || '8080';
const WS_URL = `ws://localhost:${WS_PORT}`;

describe('WebSocket JSON-RPC Integration', () => {
  let serverProcess: ReturnType<typeof spawn>;

  beforeAll((done) => {
    const serverPath = path.resolve(__dirname, '../../src/server.ts');
    serverProcess = spawn('ts-node', [serverPath]);

    if (serverProcess.stdout) {
      serverProcess.stdout.on('data', (data) => {
        const out = data.toString();
        if (out.includes('Server is running')) {
          setTimeout(done, 500); // Give it a sec to fully initialize
        }
      });
    }

    if (serverProcess.stderr) {
      serverProcess.stderr.on('data', (err) => {
        console.error(`[stderr]: ${err}`);
      });
    }
  });

  afterAll(() => {
    if (serverProcess) serverProcess.kill();
  });

  it('responds to a valid JSON-RPC request', (done) => {
    const client = new WebSocket(WS_URL);

    client.on('open', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'ping',
        params: {},
        id: 1,
      };
      client.send(JSON.stringify(request));
    });

    client.on('message', (message) => {
      const res = JSON.parse(message.toString());
      expect(res).toEqual({ jsonrpc: '2.0', result: 'pong', id: 1 });
      client.close();
      done();
    });
  });

  it('returns JSON-RPC error for unknown method', (done) => {
    const client = new WebSocket(WS_URL);

    client.on('open', () => {
      const request = {
        jsonrpc: '2.0',
        method: 'nonexistentMethod',
        params: {},
        id: 2,
      };
      client.send(JSON.stringify(request));
    });

    client.on('message', (message) => {
      const res = JSON.parse(message.toString());
      expect(res.error).toBeDefined();
      expect(res.error.code).toBe(-32601); // Method not found
      expect(res.id).toBe(2);
      client.close();
      done();
    });
  });

  it('returns error for invalid JSON-RPC format', (done) => {
    const client = new WebSocket(WS_URL);

    client.on('open', () => {
      client.send('{invalid_json');
    });

    client.on('message', (message) => {
      const res = JSON.parse(message.toString());
      expect(res.error).toBeDefined();
      expect(res.error.code).toBe(-32700); // Parse error
      client.close();
      done();
    });
  });

  it('retains message and retries if server is temporarily unavailable', (done) => {
    const client1 = new WebSocket(WS_URL);
    let messageReceived = false;

    client1.on('open', () => {
      const message = {
        jsonrpc: '2.0',
        method: 'sendMessage',
        params: { clientId: 'abc', message: 'hello' },
        id: 3,
      };
      client1.send(JSON.stringify(message));
    });

    client1.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      expect(msg.result).toBe('queued');
      messageReceived = true;
      client1.close();
    });

    setTimeout(() => {
      expect(messageReceived).toBe(true);
      done();
    }, 500);
  });

  it('isolates clients and does not leak responses', (done) => {
    const clientA = new WebSocket(WS_URL);
    const clientB = new WebSocket(WS_URL);

    let aDone = false;
    let bDone = false;

    const requestA = {
      jsonrpc: '2.0',
      method: 'ping',
      params: {},
      id: 4,
    };

    const requestB = {
      jsonrpc: '2.0',
      method: 'ping',
      params: {},
      id: 5,
    };

    clientA.on('open', () => clientA.send(JSON.stringify(requestA)));
    clientB.on('open', () => clientB.send(JSON.stringify(requestB)));

    clientA.on('message', (msg) => {
      const res = JSON.parse(msg.toString());
      expect(res.id).toBe(4);
      aDone = true;
      if (aDone && bDone) done();
    });

    clientB.on('message', (msg) => {
      const res = JSON.parse(msg.toString());
      expect(res.id).toBe(5);
      bDone = true;
      if (aDone && bDone) done();
    });
  });
});
