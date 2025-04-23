/**
 * @capability websocket:delivery-guarantee
 * Tests message queue functionality:
 * - Message persistence until acknowledged
 * - In-order delivery
 * - Redelivery on reconnect
 * - Deduplication by ID
 * - Client and service-scoped queues
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  enqueueMessage,
  acknowledgeMessage,
  getPendingMessagesForService,
  simulateServiceReconnect,
  clearQueue,
} from '../../src/events/mockWebSocketQueue';

describe('WebSocket Delivery Queue – Shared Messaging Guarantee Tests', () => {
  const clientId = 'client-ABC';
  const serviceId = 'email-service';

  beforeEach(async () => {
    await clearQueue();
  });

  it('should enqueue messages and persist them until acknowledged', async () => {
    await enqueueMessage(serviceId, clientId, 'Message 1', 'msg-1');
    await enqueueMessage(serviceId, clientId, 'Message 2', 'msg-2');

    const pending = await getPendingMessagesForService(serviceId, clientId);
    expect(pending?.map((m: any) => m.body)).toEqual(['Message 1', 'Message 2']);
  });

  it('should preserve message order', async () => {
    await enqueueMessage(serviceId, clientId, 'First', 'msg-3');
    await enqueueMessage(serviceId, clientId, 'Second', 'msg-4');

    const [first, second] = await getPendingMessagesForService(serviceId, clientId);
    expect(first.timestamp).toBeLessThan(second.timestamp);
  });

  it('should not re-deliver already acknowledged messages', async () => {
    await enqueueMessage(serviceId, clientId, 'One-off', 'msg-5');
    const [msg] = await getPendingMessagesForService(serviceId, clientId);

    await acknowledgeMessage(serviceId, clientId, msg.id);

    const remaining = await getPendingMessagesForService(serviceId, clientId);
    expect(remaining).toHaveLength(0);
  });

  it('should retry delivery after service reconnects', async () => {
    await enqueueMessage(serviceId, clientId, 'Reconnect Test', 'msg-6');

    await simulateServiceReconnect(serviceId);

    const pending = await getPendingMessagesForService(serviceId, clientId);
    expect(pending?.map((m: any) => m.body)).toContain('Reconnect Test');
  });

  it('should deduplicate messages by ID/hash and retain only one copy', async () => {
    await enqueueMessage(serviceId, clientId, 'Duplicate Message', 'msg-7');
    await enqueueMessage(serviceId, clientId, 'Duplicate Message', 'msg-7'); // Same ID

    const pending = await getPendingMessagesForService(serviceId, clientId);
    expect(pending).toHaveLength(1);
  });
});
