import path from 'path';
const rootDirectory = path.resolve(__dirname);

export default {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  //   coverageThreshold: {
  //     gloabl: {
  //       branches: 80,
  //       function: 60,
  //       lines: 75,
  //       statements: 75,
  //     },
  //   },
  collectCoverageFrom: [
    './**/*.{js.jsx,ts,tsx}',
    '!./src/alchemy-api/models/*',
    '!./src/alchemy-api/models/responses/*',
    '!./src/alchemy-api/nft-api/alchemy-nft-api.ts',
    '!./src/alchemy-api/nft-api/alchemy-nft-api.interfaces.ts',
    '!./build/**/*',
    '!./src/config/*',
    '!./src/models/*',
    '!./src/data/*',
    '!./jest.config.ts',
  ],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@server(.*)$': `${rootDirectory}/src$1`,
  },
  rootDir: rootDirectory,
  roots: [rootDirectory],
  setupFilesAfterEnv: [`./setup.ts`],
  testPathIgnorePatterns: [
    './node_modules',
    './build',
    `./setup.ts`,
    `${rootDirectory}/src/config`,
    `${rootDirectory}/src/data`,
    `${rootDirectory}/src/models`,
  ],
  transform: {
    '^.+\\.ts?$': ['ts-jest', { tsconfig: './tsconfig.json' }],
  },
};
