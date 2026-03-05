const path = require('path')

module.exports = function (api) {
  api.cache(true)

  const appSrcPath = path.join(__dirname, 'src')

  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        test(filename) {
          return typeof filename === 'string' && filename.startsWith(appSrcPath)
        },
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }]
        ],
      },
    ],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  }
}
