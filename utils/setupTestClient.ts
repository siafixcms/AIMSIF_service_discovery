// utils/setupTestClient.ts

import bcrypt from 'bcrypt';
import { mockClientService } from '../src/__mocks__/mockClientService';

type SetupOptions = {
  email?: string;
  password?: string;
};

export async function setupTestClient({
  email = 'testuser@example.com',
  password = 'S3cretP@ssw0rd',
}: SetupOptions = {}) {
  const passwordHash = await bcrypt.hash(password, 10);

  const client = { email, passwordHash };
  mockClientService.registerClient(client);

  const code = '123456'; // Fixed test 2FA code

  return {
    email,
    password,
    passwordHash,
    client,
    code,
  };
}
