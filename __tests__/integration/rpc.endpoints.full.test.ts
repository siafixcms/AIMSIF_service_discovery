// __tests__/integration/rpc.endpoints.full.test.ts

import { TestClient } from '../../utils/testClient';
import { setupTestClient } from '../../utils/setupTestClient';

describe('Auth Service RPC Endpoint Coverage', () => {
  let client: TestClient;
  let email: string;
  let password: string;
  let code: string;

  beforeAll(async () => {
    const setup = await setupTestClient();
    client = setup.client;
    email = setup.email;
    password = setup.password;
    code = setup.code;
  });

  it('calls ping()', async () => {
    const result = await client.call('ping', {});
    expect(result).toEqual({ success: true });
  });

  it('creates a password with createPassword()', async () => {
    const result = await client.call('createPassword', { email, password });
    expect(result).toEqual({ success: true });
  });

  it('authenticates user with authenticate()', async () => {
    const result = await client.call('authenticate', { email, password });
    expect(result).toEqual({ success: true });
  });

  it('verifies 2FA code with verify2FA()', async () => {
    const result = await client.call('verify2FA', { email, code });
    expect(result).toEqual({ success: true });
  });
});
