import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Avatar, Button, Card, Separator, Spinner } from 'heroui-native';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';
import { Icon } from '@/components/ui/Icon';
import { useAuth } from '@/context/AuthContext';
import { useDatabase } from '@/context/DatabaseContext';
import { performSync } from '@/lib/sync';

type MenuItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    trailing?: React.ReactNode;
    danger?: boolean;
};

function MenuItem({ icon, label, onPress, trailing, danger }: MenuItemProps) {
    return (
        <Pressable
            onPress={onPress}
            className="flex-row items-center py-3.5 px-1"
            accessibilityRole="button"
            accessibilityLabel={label}
        >
            <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${danger ? 'bg-danger/10' : 'bg-accent/10'}`}>
                <Icon name={icon} size={18} className={danger ? 'text-danger' : 'text-accent'} />
            </View>
            <Text className={`flex-1 text-base ${danger ? 'text-danger' : 'text-foreground'}`}>{label}</Text>
            {trailing}
        </Pressable>
    );
}

function MenuSection({ title, children }: { title?: string; children: React.ReactNode }) {
    return (
        <View className="mb-5">
            {title && (
                <Text className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-1">
                    {title}
                </Text>
            )}
            <Card variant="default">
                <Card.Body className="px-4 py-0">
                    {children}
                </Card.Body>
            </Card>
        </View>
    );
}

function MenuDivider() {
    return <Separator className="ml-11 bg-default/50" thickness={1} />;
}

export default function AccountScreen() {
    const router = useRouter();
    const { user, isAuthenticated, isPending, signOut } = useAuth();
    const { database } = useDatabase();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

    const appVersion = Constants.expoConfig?.version ?? '1.0.0';

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    await signOut();
                },
            },
        ]);
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

    const handleClearData = () => {
        Alert.alert(
            'Clear Local Data',
            'This will remove all locally cached data. Your cloud data will remain safe. You can re-sync after clearing.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        setSyncStatus(null);
                        setLastSyncTime(null);
                    },
                },
            ]
        );
    };

    return (
        <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-12">
            <View className="flex-1 px-4 py-6">
                {/* Profile Header */}
                <View className="items-center mb-6">
                    <Avatar size="lg" color="accent" variant="soft" className="w-20 h-20 mb-3" alt={user?.name ?? 'User'}>
                        {isAuthenticated && user?.image ? (
                            <Avatar.Image source={{ uri: user.image }} />
                        ) : null}
                        <Avatar.Fallback className="text-2xl">
                            {isAuthenticated && user
                                ? (user.name?.[0] ?? user.email[0]).toUpperCase()
                                : undefined}
                        </Avatar.Fallback>
                    </Avatar>
                    {isAuthenticated && user ? (
                        <>
                            <Text className="text-xl font-bold text-foreground">{user.name}</Text>
                            <Text className="text-sm text-muted mt-0.5">{user.email}</Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-xl font-bold text-foreground">Guest</Text>
                            <Text className="text-sm text-muted mt-0.5">Sign in to sync across devices</Text>
                        </>
                    )}
                </View>

                {/* Sign In CTA for unauthenticated users */}
                {!isAuthenticated && (
                    <View className="mb-5">
                        <Button onPress={() => router.push('/auth')} isDisabled={isPending}>
                            <Button.Label>Sign In or Create Account</Button.Label>
                        </Button>
                    </View>
                )}

                {/* Appearance */}
                <MenuSection title="Appearance">
                    <ThemeSwitcher />
                </MenuSection>

                {/* Data & Sync (authenticated only) */}
                {isAuthenticated && (
                    <MenuSection title="Data & Sync">
                        <Pressable
                            onPress={handleSync}
                            className="flex-row items-center py-3.5 px-1"
                            accessibilityRole="button"
                            accessibilityLabel="Sync Now"
                        >
                            <View className="w-8 h-8 rounded-lg items-center justify-center mr-3 bg-accent/10">
                                <Icon name="sync-outline" size={18} className="text-accent" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base text-foreground">Sync Now</Text>
                                {syncStatus && (
                                    <Text
                                        className={`text-xs mt-0.5 ${syncStatus.includes('fail') || syncStatus.includes('error') || syncStatus.includes('Error') ? 'text-danger' : 'text-muted'}`}
                                    >
                                        {syncStatus}
                                        {lastSyncTime && ` • ${lastSyncTime.toLocaleTimeString()}`}
                                    </Text>
                                )}
                            </View>
                            {isSyncing && <Spinner size="sm" color="default" />}
                        </Pressable>
                        <MenuDivider />
                        <MenuItem icon="trash-outline" label="Clear Local Data" onPress={handleClearData} danger />
                    </MenuSection>
                )}

                {/* Support & Info */}
                <MenuSection title="Support">
                    <MenuItem
                        icon="help-circle-outline"
                        label="FAQ & Help"
                        onPress={() => Linking.openURL('https://laughtrack.app/faq')}
                        trailing={<Icon name="open-outline" size={14} className="text-muted" />}
                    />
                    <MenuDivider />
                    <MenuItem
                        icon="chatbubble-outline"
                        label="Send Feedback"
                        onPress={() => Linking.openURL('mailto:support@laughtrack.app?subject=LaughTrack Feedback')}
                        trailing={<Icon name="open-outline" size={14} className="text-muted" />}
                    />
                    <MenuDivider />
                    <MenuItem
                        icon="shield-checkmark-outline"
                        label="Privacy Policy"
                        onPress={() => Linking.openURL('https://laughtrack.app/privacy')}
                        trailing={<Icon name="open-outline" size={14} className="text-muted" />}
                    />
                    <MenuDivider />
                    <MenuItem
                        icon="document-text-outline"
                        label="Terms of Service"
                        onPress={() => Linking.openURL('https://laughtrack.app/terms')}
                        trailing={<Icon name="open-outline" size={14} className="text-muted" />}
                    />
                </MenuSection>

                {/* Account Actions */}
                {isAuthenticated && (
                    <MenuSection>
                        <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleSignOut} danger />
                    </MenuSection>
                )}

                {/* App Version */}
                <View className="items-center mt-4">
                    <Text className="text-xs text-muted">LaughTrack v{appVersion}</Text>
                </View>
            </View>
        </ScrollView>
    );
}
