import { Icon } from '@/components/ui/ion-icon'
import { SafeAreaView } from '@/components/ui/safe-area-view'
import { LinearGradient } from 'expo-linear-gradient'
import React, { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

const FEATURES = [
    { icon: 'bulb-outline' as const, label: 'Comedy Techniques' },
    { icon: 'mic-outline' as const, label: 'Stage Presence' },
    { icon: 'people-outline' as const, label: 'Audience Reading' },
    { icon: 'trending-up-outline' as const, label: 'Performance Analytics' },
]

export default function LearnScreen() {
    const iconScale = useSharedValue(1)
    const iconRotate = useSharedValue(0)
    const titleOpacity = useSharedValue(0)
    const titleTranslateY = useSharedValue(20)
    const subtitleOpacity = useSharedValue(0)
    const featuresOpacity = useSharedValue(0)
    const featuresTranslateY = useSharedValue(30)
    const pulseOpacity = useSharedValue(0.3)

    useEffect(() => {
        // Entrance animations
        titleOpacity.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))
        titleTranslateY.value = withDelay(200, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }))
        subtitleOpacity.value = withDelay(500, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))
        featuresOpacity.value = withDelay(800, withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) }))
        featuresTranslateY.value = withDelay(800, withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }))

        // Looping icon animation — gentle float
        iconScale.value = withRepeat(
            withSequence(
                withTiming(1.08, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        )
        iconRotate.value = withRepeat(
            withSequence(
                withTiming(6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        )

        // Pulse ring
        pulseOpacity.value = withRepeat(
            withSequence(
                withTiming(0.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.4, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        )
    }, [])

    const iconAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: iconScale.value }, { rotate: `${iconRotate.value}deg` }],
    }))

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }))

    const subtitleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: subtitleOpacity.value,
    }))

    const featuresAnimatedStyle = useAnimatedStyle(() => ({
        opacity: featuresOpacity.value,
        transform: [{ translateY: featuresTranslateY.value }],
    }))

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }))

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 items-center justify-center px-8">
                {/* Animated icon with pulse ring */}
                <View className="items-center justify-center mb-8">
                    <Animated.View
                        style={[{ position: 'absolute', width: 120, height: 120, borderRadius: 60 }, pulseAnimatedStyle]}
                        className="bg-accent/20"
                    />
                    <Animated.View style={iconAnimatedStyle}>
                        <LinearGradient
                            colors={['rgba(var(--color-accent) / 0.15)', 'rgba(var(--color-accent) / 0.05)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <Icon name="school-outline" size={40} className="text-accent" />
                        </LinearGradient>
                    </Animated.View>
                </View>

                {/* Title */}
                <Animated.View style={titleAnimatedStyle} className="items-center">
                    <Text className="text-3xl font-bold text-foreground text-center tracking-tight">Coming Soon</Text>
                </Animated.View>

                {/* Subtitle */}
                <Animated.View style={subtitleAnimatedStyle} className="items-center mt-3 px-4">
                    <Text className="text-base text-muted text-center leading-6">
                        We're crafting lessons and tools to help you sharpen your comedy skills. Stay tuned!
                    </Text>
                </Animated.View>

                {/* Feature preview pills */}
                <Animated.View style={featuresAnimatedStyle} className="mt-10 w-full">
                    <View className="flex-row flex-wrap justify-center gap-3">
                        {FEATURES.map((feature) => (
                            <View
                                key={feature.label}
                                className="flex-row items-center gap-2 bg-field rounded-full px-4 py-2.5"
                            >
                                <Icon name={feature.icon} size={16} className="text-accent" />
                                <Text className="text-sm font-medium text-foreground">{feature.label}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </View>
        </SafeAreaView>
    )
}
