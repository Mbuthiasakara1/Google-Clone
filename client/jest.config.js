// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./src/__tests__/setupTests.js'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '\\.svg$': '<rootDir>/src/__mocks__/svgMock.js'
  },
  moduleFileExtensions: ['js', 'jsx']
};
