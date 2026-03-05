import { Icon, type IconName } from '@/components/ui/ion-icon';
import { MaterialVariant, materialVariantConfig } from '@/config/material-variants';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { PressableFeedback } from 'heroui-native';
import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MaterialTabList({ children }: { children: React.ReactNode }) {
    const insets = useSafeAreaInsets()
    return (
        <View>
            <View className='bg-field' style={{ paddingTop: insets.top }} />
            <View className='flex-row bg-field justify-center items-center py-4 gap-4'>
                {children}
            </View>
        </View>
    )
}

type MaterialTabButtonProps = TabTriggerSlotProps & {
    label: string,
    variant: MaterialVariant
};

export const MaterialTabButton = forwardRef<View, MaterialTabButtonProps>(({ label, variant, isFocused, ...props }, ref) => {
    const config = materialVariantConfig[variant];
    const focusedIcon = config.icon.replace('-outline', '') as IconName;
    return (
        <PressableFeedback ref={ref} {...props} className={`items-center rounded-xl ${isFocused ? config.iconBg : ''} px-4`}>
            <View className='flex-row items-center py-2 gap-2'>
                <Icon name={isFocused ? focusedIcon : config.icon} size={28} className={`rounded-xl ${isFocused ? config.iconColor : 'text-muted'}`} />
                <Text className={`${isFocused ? `${config.iconColor} font-semibold` : 'text-muted'}`}>
                    {label}
                </Text>
            </View>
        </PressableFeedback>
    )
})

MaterialTabButton.displayName = 'MaterialTabButton'
