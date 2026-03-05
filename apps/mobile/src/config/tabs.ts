import { IconName } from "@/components/ui/ion-icon";

interface TabItem {
  name: string;
  title: string;
  icon: IconName;
}

export const TabNavigationItems: TabItem[] = [
  {
    name: "home/index",
    title: "Home",
    icon: "home-outline",
  },
  {
    name: "material",
    title: "Material",
    icon: "library-outline",
  },
  {
    name: "learn",
    title: "Learn",
    icon: "school-outline",
  },
  {
    name: "account",
    title: "Account",
    icon: "person-circle-outline",
  },
]
