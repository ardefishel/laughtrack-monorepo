import { Icon } from "@/components/ui/ion-icon";
import { TabNavigationItems } from "@/config/tabs";
import { useI18n } from "@/i18n";
import { Tabs } from "expo-router";
import { useThemeColor } from "heroui-native";


export default function RootLayout() {
  const { t } = useI18n()

  const getTabTitle = (name: string) => {
    if (name === 'home/index') return t('navigation.tabs.home')
    if (name === 'material') return t('navigation.tabs.material')
    if (name === 'learn') return t('navigation.tabs.learn')
    if (name === 'account') return t('navigation.tabs.account')

    return name
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
