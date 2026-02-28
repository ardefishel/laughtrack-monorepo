import { Icon } from '@/components/ui/ion-icon'
import { SafeAreaView } from '@/components/ui/safe-area-view'
import { AppConfig } from '@/config/app'
import { router } from 'expo-router'
import { Avatar, Button, ListGroup, Separator } from 'heroui-native'
import { ScrollView, Text, View } from 'react-native'

export default function AccountScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1" contentContainerClassName="px-5 pb-10 pt-4">
                <Text className="text-2xl font-bold text-foreground mb-6">Account</Text>

                {/* Guest Profile Card */}
                <View className="flex-row items-center gap-4 mb-8">
                    <Avatar alt='Guest' size="lg">
                        <Avatar.Fallback />
                    </Avatar>
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-foreground">Guest</Text>
                        <Text className="text-sm text-muted">Sign in to sync your data</Text>
                    </View>
                    <Button variant="ghost" isIconOnly onPress={() => { }}>
                        <Icon name="create-outline" size={20} className="text-muted" />
                    </Button>
                </View>

                {/* Data */}
                <Text className="text-sm text-muted mb-2 ml-2">Data</Text>
                <ListGroup className="mb-6">
                    <ListGroup.Item onPress={() => { }}>
                        <ListGroup.ItemPrefix>
                            <Icon name="sync-outline" size={22} className="text-foreground" />
                        </ListGroup.ItemPrefix>
                        <ListGroup.ItemContent>
                            <ListGroup.ItemTitle>Sync Data</ListGroup.ItemTitle>
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

                {/* Login Button */}
                <Button
                    variant="primary"
                    onPress={() => router.push('/(app)/(auth)/sign-in')}
                    className="w-full"
                >
                    <Icon name="log-in-outline" size={20} className="text-accent-foreground mr-2" />
                    <Button.Label>Sign In</Button.Label>
                </Button>
            </ScrollView>
        </SafeAreaView>
    )
}
