import { Icon } from '@/components/ui/ion-icon'
import type { ErrorBoundaryProps } from 'expo-router'
import { Button } from 'heroui-native'
import { Text, View } from 'react-native'

export default function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
    return (
        <View className='flex-1 items-center justify-center bg-background px-8'>
            <Icon name='warning-outline' size={48} className='text-accent mb-4' />
            <Text className='text-foreground text-xl font-semibold mb-2'>Something went wrong</Text>
            <Text className='text-muted text-center mb-6'>{error.message}</Text>
            <Button onPress={retry}>
                <Button.Label>Try Again</Button.Label>
            </Button>
        </View>
    )
}
