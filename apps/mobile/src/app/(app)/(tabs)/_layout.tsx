import { Icon } from "@/components/ui/ion-icon";
import { TabNavigationItems } from "@/config/tabs";
import { useI18n } from "@/i18n";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";


export default function RootLayout() {
  const { t } = useI18n()

  const getTabTitle = (name: string) => {
    const item = TabNavigationItems.find((entry) => entry.name === name)

    if (!item) return name

    return t(item.titleKey)
  }

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
        title: getTabTitle(item.name),
      })} />
    ))}
  </Tabs>;
}
