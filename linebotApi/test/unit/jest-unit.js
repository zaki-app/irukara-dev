module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  // エイリアス
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/../../src/$1',
    '^test/(.*)$': '<rootDir>/../../test/$1',
  },
  // 除外するテスト
  testPathIgnorePatterns: ['/test/unit/example/'],
  // 環境変数
  setupFiles: ['../../test/setup.js'],
};
