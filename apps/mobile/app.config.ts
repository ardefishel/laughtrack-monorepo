import { ExpoConfig, ConfigContext } from 'expo/config';

const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

const reversedClientId = GOOGLE_IOS_CLIENT_ID
  ? GOOGLE_IOS_CLIENT_ID.split('.').reverse().join('.')
  : '';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'LaughTrack',
  slug: 'laughtrack',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'laughtrack',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.rtvcl.laughtrack',
    infoPlist: {
      NSMicrophoneUsageDescription: 'LaughTrack needs access to your microphone to record audio jokes.',
      ...(reversedClientId
        ? {
            CFBundleURLTypes: [
              {
                CFBundleURLSchemes: [reversedClientId],
              },
            ],
          }
        : {}),
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ['android.permission.RECORD_AUDIO', 'android.permission.MODIFY_AUDIO_SETTINGS'],
    package: 'com.rtvcl.laughtrack',
  },
  web: {
    output: 'static' as const,
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        dark: {
          backgroundColor: '#000000',
        },
      },
    ],
    [
      'expo-audio',
      {
        microphonePermission: 'LaughTrack needs access to your microphone to record audio jokes.',
      },
    ],
    '@react-native-google-signin/google-signin',
    [
      'expo-build-properties',
      {
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
