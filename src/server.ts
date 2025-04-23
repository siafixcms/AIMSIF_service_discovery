import WebSocket from 'ws';
import dotenv from 'dotenv';
import { createServer } from 'http';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7887;

const server = createServer();

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Handle incoming messages
    console.log(`Received message: ${message}`);
    // Echo the message back
    ws.send(`Echo: ${message}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server is listening on port ${PORT}`);
});
