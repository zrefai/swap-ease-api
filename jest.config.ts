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
    // './__tests__/**/*.{js.jsx,ts,tsx}',
    './src/**/*.{ts,js}',
    '!./build/**/*',
    '!./jest.config.ts',
    '!./src/routes/*',
    '!./src/data/**/*',
    '!./src/config/*',
    '!./src/models/*',
    '!./src/index.ts',
    '!./src/utils/write-to-json.ts',
    '!./src/alchemy-api/models/**/*',
  ],
  moduleDirectories: ['node_modules'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '@server(.*)$': `${rootDirectory}/src$1`,
    '@tests(.*)$': `${rootDirectory}/__tests__$1`,
  },
  rootDir: rootDirectory,
  roots: [rootDirectory],
  setupFilesAfterEnv: [`${rootDirectory}/__tests__/setup.ts`],
  testPathIgnorePatterns: [
    './node_modules',
    './build',
    `${rootDirectory}/src/data`,
    `${rootDirectory}/src/routes`,
    `${rootDirectory}/__tests__/mocks`,
    `${rootDirectory}/__tests__/setup.ts`,
  ],
  transform: {
    '^.+\\.ts?$': ['ts-jest', { tsconfig: './tsconfig.json' }],
  },
  testRegex: ['((/__tests__/.*)|(\\.|/)(test|spec))\\.tsx?$'],
};
