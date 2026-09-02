import type { Config } from 'jest';

const config: Config = {
  projects: [
    // ── Frontend tests (React components, runs in jsdom) ──────────────────
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/frontend/**/*.test.tsx'],
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: { jsx: 'react-jsx', rootDir: '.' },
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    // ── Backend tests (API routes, runs in Node) ───────────────────────────
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/backend/**/*.test.ts'],
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: { rootDir: '.' },
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
  ],
};

export default config;
