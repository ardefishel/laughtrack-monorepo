import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Spinner } from 'heroui-native';

import { ThemeSwitcher } from '../../components/theme/ThemeSwitcher';
import { useAuth } from '@/context/AuthContext';
import { database } from '@/db';
import { performSync } from '@/lib/sync';

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isPending, signOut } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Syncing...');
    const result = await performSync(database);
    setIsSyncing(false);
    setSyncStatus(result.message);
    if (result.success) {
      setLastSyncTime(new Date());
    }
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

        {isAuthenticated && (
          <View className="mb-4">
            <Text className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
              Data Sync
            </Text>
            <View className="bg-surface rounded-lg p-4">
              <View className="flex-row items-center gap-3">
                <View className="flex-1">
                  <Button onPress={handleSync} variant="outline" isDisabled={isSyncing}>
                    <Button.Label>{isSyncing ? 'Syncing...' : 'Sync Now'}</Button.Label>
                  </Button>
                </View>
                {isSyncing && <Spinner size="sm" color="default" />}
              </View>
              {syncStatus && (
                <Text className={`text-sm mt-2 ${syncStatus.includes('fail') || syncStatus.includes('error') || syncStatus.includes('Error') ? 'text-danger' : 'text-muted'}`}>
                  {syncStatus}
                </Text>
              )}
              {lastSyncTime && (
                <Text className="text-xs text-muted mt-1">
                  Last synced: {lastSyncTime.toLocaleTimeString()}
                </Text>
              )}
            </View>
          </View>
        )}

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
