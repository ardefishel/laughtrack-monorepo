import { ConfigContext, ExpoConfig } from "expo/config";
import { AppConfig } from "./src/config/app.ts";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: AppConfig.name,
  slug: AppConfig.slug,
  version: AppConfig.version,
  orientation: "portrait",
  icon: './src/assets/ios-light.png',
  scheme: AppConfig.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: AppConfig.ios.bundleIdentifier,
    icon: {
      light: './src/assets/ios-light.png',
      dark: './src/assets/ios-dark.png',
      tinted: './src/assets/ios-tinted.png',
    }
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#ffffff',
      foregroundImage: './src/assets/adaptive-icon.png',
    },
    edgeToEdgeEnabled: true,
    package: AppConfig.android.package,
  },
  web: {
    output: "single",
    favicon: "./src/assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: './src/assets/splash-icon-light.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
          image: './src/assets/splash-icon-dark.png',
        },
      },
    ],
    '@react-native-google-signin/google-signin',
    [
      'expo-build-properties',
      {
        ios: {
          infoPlist: {
            NSAppTransportSecurity: {
              NSAllowsLocalNetworking: true,
            },
          },
        },
        android: {
          googleServicesFile: './google-services.json',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
