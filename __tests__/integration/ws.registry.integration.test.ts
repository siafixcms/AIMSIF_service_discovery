// __tests__/integration/ws.registry.integration.test.ts

/**
 * @capabilities
 * - Registers services by name/host/port over WebSocket
 * - Lists all currently active services
 * - Responds to lookup(name) requests with connection info
 * - Cleans up registry on WebSocket disconnection
 */

import dotenv from 'dotenv';
dotenv.config();

import { TestClient } from '../../utils/testClient';

const PORT = process.env.PORT || '7887';
const registryUrl = `ws://localhost:${PORT}`;

describe('Service Registry WebSocket Protocol', () => {
  let clientA: TestClient;
  let clientB: TestClient;

  beforeEach(async () => {
    clientA = new TestClient(registryUrl);
    await clientA.connect();

    clientB = new TestClient(registryUrl);
    await clientB.connect();
  });

  afterEach(() => {
    clientA.close();
    clientB.close();
  });

  it('registers services correctly', async () => {
    const response = await clientA.call('register', {
      name: 'aimsif_auth',
      host: 'localhost',
      port: 7886,
    });
    expect(response).toEqual({ success: true });
  });

  it('lists all registered services', async () => {
    await clientA.call('register', {
      name: 'aimsif_auth',
      host: 'localhost',
      port: 7886,
    });

    await clientB.call('register', {
      name: 'aimsif_client',
      host: 'localhost',
      port: 7887,
    });

    const response = await clientA.call('list');
    expect(Array.isArray(response)).toBe(true);
    const names = response.map((s: any) => s.name);
    expect(names).toContain('aimsif_auth');
    expect(names).toContain('aimsif_client');
  });

  it('responds with service info on lookup', async () => {
    await clientA.call('register', {
      name: 'aimsif_auth',
      host: 'localhost',
      port: 7886,
    });

    const result = await clientB.call('lookup', { name: 'aimsif_auth' });
    expect(result).toEqual({ host: 'localhost', port: 7886 });
  });

  it('returns null for unknown service lookup', async () => {
    const result = await clientA.call('lookup', { name: 'non_existent_service' });
    expect(result).toBeNull();
  });

  it('removes service when WebSocket disconnects', async () => {
    await clientA.call('register', {
      name: 'aimsif_auth',
      host: 'localhost',
      port: 7886,
    });

    clientA.close();

    await new Promise((res) => setTimeout(res, 100));

    const lookup = await clientB.call('lookup', { name: 'aimsif_auth' });
    expect(lookup).toBeNull();
  });
});
