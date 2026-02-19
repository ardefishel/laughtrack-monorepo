import { ErrorBoundary } from "@/components/ErrorBoundary";
import { HeaderTitleWidthContext, useHeaderTitleWidth } from '@/hooks/useHeaderTitleWidth';
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useCallback, useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Text, View } from "react-native";
import { useCSSVariable, useResolveClassNames, withUniwind } from "uniwind";

const StyledView = withUniwind(View);

export { useHeaderTitleWidth };

function HeaderTitle({ onLayout }: { onLayout?: (e: LayoutChangeEvent) => void }) {
  return (
    <StyledView className="flex-row items-center h-full" onLayout={onLayout}>
      <Text className="text-accent text-xl italic font-black">Laugh</Text>
      <Text className="text-foreground text-xl ">Track</Text>
    </StyledView>
  );
}

export default function TabsLayout() {
  const headerStyle = useResolveClassNames('bg-background h-30');
  const tabBarStyle = useResolveClassNames('bg-background border-t border-default pt-2');
  const [titleWidth, setTitleWidth] = useState(0);

  const [accentColor, foregroundColor, mutedColor] = useCSSVariable(['--accent', '--foreground', '--muted']);

  const handleTitleLayout = useCallback((e: LayoutChangeEvent) => {
    setTitleWidth(e.nativeEvent.layout.width);
  }, []);

  const renderHeaderTitle = useCallback(() => (
    <HeaderTitle onLayout={handleTitleLayout} />
  ), [handleTitleLayout]);

  return (
    <HeaderTitleWidthContext.Provider value={titleWidth}>
      <ErrorBoundary sectionName="Main Tabs">
        <Tabs
          screenOptions={{
            headerShown: true,
            headerTitle: renderHeaderTitle,
            headerStyle,
            headerTintColor: foregroundColor as string,
            headerTitleAlign: 'left',
            tabBarStyle,
            tabBarActiveTintColor: accentColor as string,
            tabBarInactiveTintColor: mutedColor as string,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Jokes",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="sets"
            options={{
              title: "Sets",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="library-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="learn"
            options={{
              title: "Learn",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="school-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="account"
            options={{
              title: "Account",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="person-outline" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </ErrorBoundary>
    </HeaderTitleWidthContext.Provider>
  );
}
