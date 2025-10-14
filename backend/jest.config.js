module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};