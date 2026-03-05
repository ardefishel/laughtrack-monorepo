import { Icon } from "@/components/ui/ion-icon";
import { TabNavigationItems } from "@/config/tabs";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";


export default function RootLayout() {

  return <Tabs screenOptions={{
    tabBarStyle: {
      backgroundColor: useThemeColor("field"),
      borderTopWidth: 0,
      borderTopColor: 'transparent',
    },
    headerShown: false,
    tabBarActiveTintColor: useThemeColor("accent"),
  }}>
    {TabNavigationItems.map((item) => (
      <Tabs.Screen key={item.name} name={item.name} options={({ route, navigation }) => ({
        tabBarIcon: ({ size, color }) => (<Icon name={item.icon} size={size} color={color} />),
        title: item.title,
      })} />
    ))}
  </Tabs>;
}
