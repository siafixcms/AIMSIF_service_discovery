/**
 * @capability infrastructure:connectivity-check
 * Verifies environment variables and live DB connectivity for MongoDB and Redis.
 */

import { describe, it, expect } from '@jest/globals';
import mongoose from 'mongoose';
import { createClient } from 'redis';
jest.setTimeout(15000);

describe('Environment & Infrastructure Connectivity', () => {
  it('should have MONGODB_URI defined', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
  });

  it('should have REDIS_URL defined', () => {
    expect(process.env.REDIS_URL).toBeDefined();
  });

  it('can connect to MongoDB', async () => {
    const uri = process.env.MONGODB_URI!;
    await expect(mongoose.connect(uri)).resolves.toBeDefined();
    await mongoose.disconnect();
  });

  it('can connect to Redis', async () => {
    const client = createClient({
      url: process.env.REDIS_URL!,
    });

    await expect(client.connect()).resolves.toBeDefined();
    await client.disconnect();
  });
});
