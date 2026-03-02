import { router } from 'expo-router'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

export default function Page2Screen() {
    return (
        <View>
            <Text>Page2Screen</Text>
            <Pressable onPress={() => { router.push("/(app)/(tabs)/learn/detail") }}>
                <Text>go to detail page</Text>
            </Pressable>
        </View>
    )
}
