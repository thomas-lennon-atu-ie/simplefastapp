export default {
  preset: 'jest-expo',
  testTimeout: 15000, 
  moduleNameMapper: {
    '^react-native-reanimated$': '<rootDir>/node_modules/react-native-reanimated/mock',
    '^react-native-reanimated/(.*)$': '<rootDir>/node_modules/react-native-reanimated/mock',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/styleMock.js',
    '^@env$': '<rootDir>/__mocks__/envMock.js',
  },
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    './jest.setup.js',
  ],
  forceExit: false, 
  detectOpenHandles: false,
  globalSetup: './setupGlobalJest.js',
  globalTeardown: './teardownGlobalJest.js',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|firebase|@firebase|lottie-react-native)',
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
  ],
  testEnvironment: 'jsdom',
  clearMocks: true,
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  verbose: true,
 
  reporters: [
    'default',
    ['<rootDir>/jest-custom-reporter.js', {}]
  ],
};