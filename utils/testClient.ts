// testClient.ts

import WebSocket from 'ws';

type JSONRPCRequest = {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: number;
};

type JSONRPCResponse = {
  jsonrpc: '2.0';
  result?: any;
  error?: { code: number; message: string };
  id: number;
};

export class TestClient {
  private ws: WebSocket;
  private requestId = 1;
  private pending = new Map<number, (res: JSONRPCResponse) => void>();

  constructor(private url: string) {
    this.ws = new WebSocket(url);

    this.ws.on('message', (data) => {
      const response: JSONRPCResponse = JSON.parse(data.toString());
      const resolver = this.pending.get(response.id);
      if (resolver) {
        resolver(response);
        this.pending.delete(response.id);
      }
    });

    this.ws.on('error', (err) => {
      console.error('WebSocket error:', err);
    });
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws.on('open', () => resolve());
      this.ws.on('error', (err) => reject(err));
    });
  }

  async call(method: string, params?: any): Promise<any> {
    const id = this.requestId++;
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id,
    };

    return new Promise((resolve, reject) => {
      this.pending.set(id, (response) => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.result);
        }
      });

      this.ws.send(JSON.stringify(request));
    });
  }

  close(): void {
    this.ws.close();
  }
}
