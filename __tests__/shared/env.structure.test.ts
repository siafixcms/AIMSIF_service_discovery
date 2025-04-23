/**
 * @capability infrastructure:env-validation
 * Verifies that .env.test and .env (if present) contain all required keys from .env.example.
 * Ensures all variables are non-empty to avoid runtime misconfigurations.
 */

import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const parseEnv = (filename: string): Record<string, string> => {
  const filepath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filepath)) return {};
  return dotenv.parse(fs.readFileSync(filepath));
};

describe('Environment Variable Files', () => {
  const exampleEnv = parseEnv('.env.example');
  const testEnv = parseEnv('.env.test');
  const mainEnv = parseEnv('.env');

  const checkEnvs = [
    { name: '.env.test', content: testEnv },
    ...(Object.keys(mainEnv).length > 0 ? [{ name: '.env', content: mainEnv }] : [])
  ];

  it('should have .env.example defined and not empty', () => {
    expect(Object.keys(exampleEnv).length).toBeGreaterThan(0);
  });

  for (const env of checkEnvs) {
    describe(`${env.name}`, () => {
      it(`contains all keys from .env.example`, () => {
        for (const key of Object.keys(exampleEnv)) {
          expect(env.content).toHaveProperty(key);
        }
      });

      it(`does not have empty values for required keys`, () => {
        for (const key of Object.keys(exampleEnv)) {
          expect(env.content[key]).toBeTruthy();
        }
      });
    });
  }
});
