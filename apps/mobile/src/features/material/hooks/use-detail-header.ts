import { Button } from 'heroui-native';
import { createElement, useLayoutEffect } from 'react';

type UseDetailHeaderOptions = {
  navigation: { setOptions: (options: Record<string, unknown>) => void };
  title: string;
  onSave: () => void;
  canSave: boolean;
  isEditing: boolean;
};

export function useDetailHeader({ navigation, title, onSave, canSave, isEditing }: UseDetailHeaderOptions) {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
      headerRight: () =>
        createElement(
          Button,
          { size: 'sm', variant: 'ghost', onPress: onSave, isDisabled: !canSave },
          createElement(Button.Label, { className: 'text-accent font-semibold' }, isEditing ? 'Save' : 'Create')
        )
    });
  }, [navigation, title, onSave, canSave, isEditing]);
}
