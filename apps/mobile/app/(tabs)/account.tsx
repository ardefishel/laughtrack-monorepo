import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { ScrollView, Text, View } from "react-native";
import { ThemeSwitcher } from "../../components/theme/ThemeSwitcher";

export default function AccountScreen() {
  const router = useRouter()
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-foreground">
            Account
          </Text>
          <Text className="text-base text-muted mt-1">
            Manage your preferences
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-muted uppercase tracking-wide mb-3">
            Appearance
          </Text>
          <ThemeSwitcher />
        </View>

        <View className="bg-surface rounded-lg p-4">
          <Text className="text-base font-semibold text-foreground mb-2">
            Account Information
          </Text>
          <Text className="text-sm text-muted">
            More account settings will appear here.
          </Text>
        </View>
        <View className="bg-surface rounded-lg p-4">
          <Button onPress={() => router.push('/auth')}>
            <Text>Sign In</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
