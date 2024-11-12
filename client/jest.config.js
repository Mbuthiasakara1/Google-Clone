// jest.config.js
module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['./jest.setup.js'],
    transform: {
      '^.+\\.jsx?$': 'babel-jest', 
    },
    moduleFileExtensions: ['js', 'jsx'],
    setupFilesAfterEnv: ['./src/__tests__/setupTests.js'],
  };
  