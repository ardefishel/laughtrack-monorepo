import { IconName } from "@/components/ui/ion-icon";

interface TabItem {
  name: string;
  titleKey: string;
  icon: IconName;
}

export const TabNavigationItems: TabItem[] = [
  {
    name: "home/index",
    titleKey: "navigation.tabs.home",
    icon: "home-outline",
  },
  {
    name: "material",
    titleKey: "navigation.tabs.material",
    icon: "library-outline",
  },
  {
    name: "learn",
    titleKey: "navigation.tabs.learn",
    icon: "school-outline",
  },
  {
    name: "account",
    titleKey: "navigation.tabs.account",
    icon: "person-circle-outline",
  },
]
