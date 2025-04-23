import { WebSocket } from 'ws';
import { registryService } from './service';

export default {
  onMessage: (message: any, ws: WebSocket) => {
    registryService.handle(ws, JSON.stringify(message));
  },
  onClose: (ws: WebSocket) => {
    registryService.unregister(ws);
  },
};
