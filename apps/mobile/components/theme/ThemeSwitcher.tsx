import { ControlField, Description, Label } from 'heroui-native';
import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/context/ThemeContext';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <ControlField isSelected={isDark} onSelectedChange={toggleTheme} className="py-3 px-1">
      <View className="w-8 h-8 rounded-lg items-center justify-center mr-3 bg-accent/10">
        <Icon name={isDark ? 'moon-outline' : 'sunny-outline'} size={18} className="text-accent" />
      </View>
      <View className="flex-1">
        <Label className="text-base text-foreground">{isDark ? 'Dark Mode' : 'Light Mode'}</Label>
        <Description className="text-xs text-muted">
          {isDark ? 'Easier on the eyes at night' : 'Classic bright appearance'}
        </Description>
      </View>
      <ControlField.Indicator />
    </ControlField>
  );
}
