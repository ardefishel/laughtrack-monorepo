module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Enable decorator support for WatermelonDB models
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Required for React Native with new architecture
      'react-native-reanimated/plugin',
    ],
  };
};
