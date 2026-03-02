import { useAuth } from '@/context/auth-context'
import { Icon } from '@/components/ui/ion-icon'
import { SafeAreaView } from '@/components/ui/safe-area-view'
import { AppConfig } from '@/config/app'
import { database } from '@/database'
import { performSync } from '@/lib/sync'
import { router } from 'expo-router'
import { Avatar, Button, ListGroup, Separator } from 'heroui-native'
import { useCallback, useState } from 'react'
import { Alert, ScrollView, Text, View } from 'react-native'

export default function AccountScreen() {
    const { user, isAuthenticated, signOut } = useAuth()
    const [isSyncing, setIsSyncing] = useState(false)

    const handleSync = useCallback(async () => {
        if (!isAuthenticated) {
            Alert.alert('Sign In Required', 'Please sign in to sync your data.', [
                { text: 'Cancel' },
                { text: 'Sign In', onPress: () => router.push('/(app)/(auth)/sign-in') }
            ])
            return
        }
        setIsSyncing(true)
        try {
            const result = await performSync(database)
            if (result.success) {
                Alert.alert('Sync Complete', result.message)
            } else {
                Alert.alert('Sync Failed', result.message)
            }
        } finally {
            setIsSyncing(false)
        }
    }, [isAuthenticated])

    const handleSignOut = useCallback(async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: () => void signOut() }
        ])
    }, [signOut])

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-4">
                <Text className="text-2xl font-bold text-foreground mb-6">Account</Text>

                <View className="flex-row items-center gap-4 mb-8">
                    <Avatar alt={user?.name ?? 'Guest'} size="lg">
                        {user?.image ? <Avatar.Image source={{ uri: user.image }} /> : <Avatar.Fallback />}
                    </Avatar>
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">{user?.name ?? 'Guest'}</Text>
                        <Text className="text-sm text-muted">{isAuthenticated ? user?.email : 'Sign in to sync your data'}</Text>
                    </View>
                </View>

                {/* Data */}
                <Text className="text-sm text-muted mb-2 ml-2">Data</Text>
                <ListGroup className="mb-6">
                    <ListGroup.Item onPress={handleSync} disabled={isSyncing}>
                        <ListGroup.ItemPrefix>
                            <Icon name="sync-outline" size={22} className="text-foreground" />
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                            <ListGroup.ItemTitle>{isSyncing ? 'Syncing...' : 'Sync Data'}</ListGroup.ItemTitle>
                            <ListGroup.ItemDescription>Back up and restore your data</ListGroup.ItemDescription>
                        </ListGroup.ItemContent>
                        <ListGroup.ItemSuffix />
                    </ListGroup.Item>
                </ListGroup>

                {/* Information */}
                <Text className="text-sm text-muted mb-2 ml-2">Information</Text>
                <ListGroup className="mb-6">
                    <ListGroup.Item onPress={() => { }}>
                        <ListGroup.ItemPrefix>
                            <Icon name="help-circle-outline" size={22} className="text-foreground" />
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                            <ListGroup.ItemTitle>FAQ</ListGroup.ItemTitle>
                        </ListGroup.ItemContent>
                        <ListGroup.ItemSuffix />
                    </ListGroup.Item>
                    <Separator className="mx-4" />
                    <ListGroup.Item onPress={() => { }}>
                        <ListGroup.ItemPrefix>
                            <Icon name="document-text-outline" size={22} className="text-foreground" />
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                            <ListGroup.ItemTitle>Terms of Service</ListGroup.ItemTitle>
                        </ListGroup.ItemContent>
                        <ListGroup.ItemSuffix />
                    </ListGroup.Item>
                    <Separator className="mx-4" />
                    <ListGroup.Item>
                        <ListGroup.ItemPrefix>
                            <Icon name="information-circle-outline" size={22} className="text-foreground" />
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                            <ListGroup.ItemTitle>App Version</ListGroup.ItemTitle>
                        </ListGroup.ItemContent>
                        <ListGroup.ItemSuffix>
                            <Text className="text-sm text-muted">{AppConfig.version}</Text>
                        </ListGroup.ItemSuffix>
                    </ListGroup.Item>
                </ListGroup>

                {isAuthenticated ? (
                    <Button
                        variant="primary"
                        onPress={handleSignOut}
                        className="w-full"
                    >
                        <Icon name="log-out-outline" size={20} className="text-accent-foreground mr-2" />
                        <Button.Label>Sign Out</Button.Label>
                    </Button>
                ) : (
                    <Button
                        variant="primary"
                        onPress={() => router.push('/(app)/(auth)/sign-in')}
                        className="w-full"
                    >
                        <Icon name="log-in-outline" size={20} className="text-accent-foreground mr-2" />
                        <Button.Label>Sign In</Button.Label>
                    </Button>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}
