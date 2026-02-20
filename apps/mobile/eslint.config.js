// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'android/*', 'ios/*', '**/node_modules/**'],
  },
  {
    settings: {
      'import/ignore': ['@laughtrack/', 'react-native', 'expo-'],
    },
    rules: {
      'import/no-unresolved': ['error', { ignore: ['^@laughtrack/'] }],
    },
  },
]);
