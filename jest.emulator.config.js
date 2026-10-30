/**
 * Testes de integração contra os emuladores do Firebase (Auth + Firestore). Não rodam no `npm test`
 * (exigem Java e o CLI do Firebase); use `npm run test:rules`.
 *
 * Rodam em Node puro (sem o preset do React Native): o SDK do Firebase precisa do `fetch` e do
 * stream reais do Node, e o ambiente do `jest-expo` os substitui por polyfills do React Native.
 */
// babel-preset-expo vem aninhado em node_modules/expo: resolve a partir do pacote `expo`.
const babelPresetExpo = require.resolve('babel-preset-expo', { paths: [require.resolve('expo/package.json')] });

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.emulator.test.ts'],
  testTimeout: 60000,
  transform: {
    '\\.[jt]sx?$': ['babel-jest', { presets: [babelPresetExpo] }],
  },
};
