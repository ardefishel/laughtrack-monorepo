import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

export function useKeyboardOffset() {
    const tabBarHeight = useBottomTabBarHeight()
    const [keyboardOffset, setKeyboardOffset] = useState(0)

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

        const showSub = Keyboard.addListener(showEvent, (e) => {
            setKeyboardOffset(Math.max(0, e.endCoordinates.height - tabBarHeight))
        })

        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardOffset(0)
        })

        return () => {
            showSub.remove()
            hideSub.remove()
        }
    }, [tabBarHeight])

    return keyboardOffset
}
