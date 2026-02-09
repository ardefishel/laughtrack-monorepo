import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AudioProvider } from '@/context/AudioContext';
import { DatabaseProvider } from '@/context/DatabaseContext';
import { SetEditingProvider } from '@/context/SetEditingContext';
import { ThemeProvider } from '@/context/ThemeContext';
import '@/global.css';
import { Stack } from 'expo-router';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useCSSVariable, useResolveClassNames } from 'uniwind';

function ThemedStack() {
  const [foregroundColor] = useCSSVariable(['--foreground']);
  const headerStyle = useResolveClassNames('bg-background') as any;
  const contentStyle = useResolveClassNames('bg-background');
  return (
    <Stack
      screenOptions={{
        presentation: 'card',
        headerBackTitle: 'Back',
        headerStyle,
        headerTintColor: foregroundColor as string,
        contentStyle,
      }}>
      {/* Tabs */}
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false
        }}
      />
      {/* Jokes */}
      <Stack.Screen name="jokes/[id]" />
      {/* Sets */}
      <Stack.Screen name="sets/[id]/index" />
      <Stack.Screen name="sets/[id]/edit" options={{ presentation: 'formSheet', headerShown: false, sheetAllowedDetents: [0.8] }} />
      <Stack.Screen name="sets/[id]/select-jokes" options={{ presentation: 'modal', headerTitle: 'Select Jokes' }} />
      {/* Learn */}
      <Stack.Screen name="learn/[collectionId]/index" />
      <Stack.Screen name="learn/[collectionId]/[articleId]/index" />

      {/* Bottom Sheets */}
      <Stack.Screen
        name="recording-list-bottom-sheet"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.25, 0.5, 0.8],
          sheetInitialDetentIndex: 1,
        }}
      />
      <Stack.Screen
        name="recording-capture-bottom-sheet"
        options={{
          headerShown: false,
          presentation: 'formSheet',
          sheetAllowedDetents: [0.5, 0.8],
          sheetInitialDetentIndex: 0,
        }}
      />

      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="auth/index" options={{ headerShown: false }} />
      <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="auth/forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="auth/change-password" options={{ headerShown: false }} />
      <Stack.Screen name="auth/verify-forgot-password" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary sectionName="Root">
        <HeroUINativeProvider>
          <DatabaseProvider>
            <ThemeProvider>
              <AudioProvider>
                <SetEditingProvider mode="edit">
                  <ThemedStack />
                </SetEditingProvider>
              </AudioProvider>
            </ThemeProvider>
          </DatabaseProvider>
        </HeroUINativeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
