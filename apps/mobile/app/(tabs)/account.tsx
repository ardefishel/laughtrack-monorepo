import { useRouter } from 'expo-router';
import { Button } from 'heroui-native';
import { ScrollView, Text, View } from 'react-native';

import { ThemeSwitcher } from '../../components/theme/ThemeSwitcher';
import { useAuth } from '@/context/AuthContext';

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isPending, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">
            Account
          </Text>
          <Text className="text-base text-muted mt-1">
            Manage your preferences
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
            Appearance
          </Text>
          <ThemeSwitcher />
        </View>

        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-base font-semibold text-foreground mb-2">
            Account Information
          </Text>
          {isAuthenticated && user ? (
            <Text className="text-sm text-muted">{user.email}</Text>
          ) : (
            <Text className="text-sm text-muted">
              Sign in to sync your data across devices.
            </Text>
          )}
        </View>

        <View className="bg-surface rounded-lg p-4">
          {isAuthenticated ? (
            <Button onPress={handleSignOut} variant="outline">
              <Button.Label>Sign Out</Button.Label>
            </Button>
          ) : (
            <Button onPress={() => router.push('/auth')} isDisabled={isPending}>
              <Button.Label>Sign In</Button.Label>
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
