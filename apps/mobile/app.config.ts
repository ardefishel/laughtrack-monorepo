import "dotenv/config";
import { ConfigContext, ExpoConfig } from "expo/config";

const APP_CONFIG = {
  name: 'LaughTrack',
  slug: 'laughtrack',
  scheme: 'laughtrack',
  version: '1.0.0',
  ios: {
    bundleIdentifier: 'com.rtvcl.laughtrack'
  },
  android: {
    package: 'com.rtvcl.laughtrack'
  }
}

const IOS_CLIENT_ID_SUFFIX = '.apps.googleusercontent.com'
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
const googleIosUrlScheme =
  googleIosClientId && googleIosClientId.endsWith(IOS_CLIENT_ID_SUFFIX)
    ? `com.googleusercontent.apps.${googleIosClientId.replace(IOS_CLIENT_ID_SUFFIX, '')}`
    : undefined

const isDev = process.env.EAS_BUILD_PROFILE === 'development' || !process.env.EAS_BUILD_PROFILE

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_CONFIG.name,
  slug: APP_CONFIG.slug,
  version: APP_CONFIG.version,
  orientation: "portrait",
  icon: './src/assets/ios-light.png',
  scheme: APP_CONFIG.scheme,
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  platforms: ["android", "ios"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: APP_CONFIG.ios.bundleIdentifier,
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
    package: APP_CONFIG.android.package,
  },
  web: {
    output: "single",
    favicon: "./src/assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
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
    googleIosUrlScheme
      ? ['@react-native-google-signin/google-signin', { iosUrlScheme: googleIosUrlScheme }]
      : '@react-native-google-signin/google-signin',
    [
      'expo-build-properties',
      {
        ios: {
          infoPlist: {
            ...(isDev ? { NSAppTransportSecurity: { NSAllowsLocalNetworking: true } } : {}),
            ITSAppUsesNonExemptEncryption: false
          },
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  owner: process.env.EAS_OWNER,
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID
    }
  }
});
