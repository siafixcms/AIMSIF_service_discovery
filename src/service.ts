import { WebSocket } from 'ws';

type ServiceInfo = {
  name: string;
  host: string;
  port: number;
};

type Registry = Map<WebSocket, ServiceInfo>;

export class ServiceRegistry {
  private registry: Registry = new Map();

  // Built-in handlers
  private handlers: Record<string, Function> = {
    ping: async () => 'pong',
  };

  register(socket: WebSocket, info: ServiceInfo) {
    this.registry.set(socket, info);
  }

  unregister(socket: WebSocket) {
    this.registry.delete(socket);
  }

  list(): ServiceInfo[] {
    return Array.from(this.registry.values());
  }

  lookup(name: string): ServiceInfo | null {
    return this.list().find((s) => s.name === name) ?? null;
  }

  handle(socket: WebSocket, message: string) {
    try {
      const { jsonrpc, method, params, id } = JSON.parse(message);

      if (jsonrpc !== '2.0' || typeof method !== 'string' || !id) {
        return socket.send(JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32600, message: 'Invalid Request' },
        }));
      }

      if (method === 'register') {
        if (!params?.name || !params?.host || typeof params.port !== 'number') {
          return socket.send(JSON.stringify({
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: 'Invalid params' },
          }));
        }

        this.register(socket, params);
        return socket.send(JSON.stringify({ jsonrpc: '2.0', id, result: true }));
      }

      if (method === 'list') {
        return socket.send(JSON.stringify({ jsonrpc: '2.0', id, result: this.list() }));
      }

      if (method === 'lookup') {
        const service = this.lookup(params?.name);
        return socket.send(JSON.stringify({ jsonrpc: '2.0', id, result: service }));
      }

      // Built-in or plugin handler
      if (this.handlers[method]) {
        Promise.resolve(this.handlers[method](params))
          .then(result => socket.send(JSON.stringify({ jsonrpc: '2.0', id, result })))
          .catch(err => {
            socket.send(JSON.stringify({
              jsonrpc: '2.0',
              id,
              error: { code: -32603, message: err.message || 'Internal error' }
            }));
          });
        return;
      }

      return socket.send(JSON.stringify({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method '${method}' not found in service 'aimsif_service_discovery'`,
        },
      }));
    } catch (err) {
      socket.send(JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32700, message: 'Parse error' },
      }));
    }
  }
}

export const registryService = new ServiceRegistry();