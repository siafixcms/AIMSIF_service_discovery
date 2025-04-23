// __tests__/auth/auth.service.integration.test.ts

import { createPassword, authenticate, verify2FA } from '../../src/service';
import { mockClientService } from '../../src/__mocks__/mockClientService';
import { setupTestClient } from '../../utils/setupTestClient';

describe('Auth Service Integration', () => {
  const code = '123456';
  let email: string;
  let password: string;

  beforeEach(async () => {
    mockClientService.reset();
    const setup = await setupTestClient();
    email = setup.email;
    password = setup.password;
  });

  it('creates a hashed password', async () => {
    const result = await createPassword(password);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('authenticates with valid email and password', async () => {
    const result = await authenticate(email, password);
    expect(result.success).toBe(true);
  });

  it('fails authentication for non-existent user', async () => {
    const result = await authenticate('fake@example.com', 'wrong');
    expect(result.success).toBe(false);
  });

  it('fails authentication for wrong password', async () => {
    const result = await authenticate(email, 'wrongpassword');
    expect(result.success).toBe(false);
  });

  it('verifies correct 2FA code', async () => {
    const result = await verify2FA(email, code);
    expect(result).toEqual({ success: true });
  });

  it('rejects incorrect 2FA code', async () => {
    const result = await verify2FA(email, '000000');
    expect(result).toEqual({ success: false });
  });
});
