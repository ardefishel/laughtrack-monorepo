import { SetEditingProvider } from '@/context/SetEditingContext';
import { Stack } from 'expo-router';

export default function NewSetLayout() {
  return (
    <SetEditingProvider mode="create">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="select-jokes" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.8] }} />
        <Stack.Screen name="edit-detail" options={{ presentation: 'formSheet', sheetAllowedDetents: [0.8] }} />
      </Stack>
    </SetEditingProvider>
  );
}
