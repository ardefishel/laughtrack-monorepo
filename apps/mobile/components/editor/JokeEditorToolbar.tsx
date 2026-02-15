import { KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native';
import { withUniwind } from 'uniwind';

import { Icon } from '@/components/ui/Icon';

const StyledPressable = withUniwind(Pressable);

interface EditorToolbarProps {
  onH1: () => void;
  onH2: () => void;
  onParagraph: () => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  activeStyles: {
    h1: boolean;
    h2: boolean;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    isParagraph?: boolean;
  };
  audioCount?: number;
  onOpenAudioList?: () => void;
}

export function JokeEditorToolbar({
  onH1,
  onH2,
  onParagraph,
  onBold,
  onItalic,
  onUnderline,
  activeStyles,
  audioCount = 0,
  onOpenAudioList,
}: EditorToolbarProps) {
  const isParagraph = activeStyles.isParagraph ?? (!activeStyles.h1 && !activeStyles.h2);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.select({ ios: 100, android: 20 })}
    >
      <View className="flex-row items-center gap-2 p-3 border-t border-default bg-surface">
        <StyledPressable
          onPress={onH1}
          accessibilityRole="button"
          accessibilityLabel="Heading 1"
          accessibilityState={{ selected: activeStyles.h1 }}
          className={`px-3 py-1.5 rounded-md ${activeStyles.h1 ? 'bg-accent' : 'bg-field-background'
            }`}
        >
          <Text
            className={`text-sm font-bold ${activeStyles.h1 ? 'text-accent-foreground' : 'text-foreground'
              }`}
          >
            H1
          </Text>
        </StyledPressable>

        <StyledPressable
          onPress={onH2}
          accessibilityRole="button"
          accessibilityLabel="Heading 2"
          accessibilityState={{ selected: activeStyles.h2 }}
          className={`px-3 py-1.5 rounded-md ${activeStyles.h2 ? 'bg-accent' : 'bg-field-background'
            }`}
        >
          <Text
            className={`text-sm font-bold ${activeStyles.h2 ? 'text-accent-foreground' : 'text-foreground'
              }`}
          >
            H2
          </Text>
        </StyledPressable>

        <StyledPressable
          onPress={onParagraph}
          accessibilityRole="button"
          accessibilityLabel="Paragraph"
          accessibilityState={{ selected: isParagraph }}
          className={`px-3 py-1.5 rounded-md ${isParagraph ? 'bg-accent' : 'bg-field-background'
            }`}
        >
          <Text
            className={`text-sm ${isParagraph ? 'text-accent-foreground' : 'text-foreground'
              }`}
          >
            P
          </Text>
        </StyledPressable>

        <View className="w-px h-6 bg-default mx-2" />

        <StyledPressable
          onPress={onBold}
          accessibilityRole="button"
          accessibilityLabel="Bold"
          accessibilityState={{ selected: activeStyles.bold }}
          className={`px-3 py-1.5 rounded-md ${activeStyles.bold ? 'bg-accent' : 'bg-field-background'
            }`}
        >
          <Text
            className={`text-sm font-bold ${activeStyles.bold ? 'text-accent-foreground' : 'text-foreground'
              }`}
          >
            B
          </Text>
        </StyledPressable>

        <StyledPressable
          onPress={onItalic}
          accessibilityRole="button"
          accessibilityLabel="Italic"
          accessibilityState={{ selected: activeStyles.italic }}
          className={`px-3 py-1.5 rounded-md ${activeStyles.italic ? 'bg-accent' : 'bg-field-background'
            }`}
        >
          <Text
            className={`text-sm italic ${activeStyles.italic ? 'text-accent-foreground' : 'text-foreground'
              }`}
          >
            I
          </Text>
        </StyledPressable>

        <StyledPressable
          onPress={onUnderline}
          accessibilityRole="button"
          accessibilityLabel="Underline"
          accessibilityState={{ selected: activeStyles.underline }}
          className={`px-3 py-1.5 rounded-md ${activeStyles.underline ? 'bg-accent' : 'bg-field-background'
            }`}
        >
          <Text
            className={`text-sm underline ${activeStyles.underline ? 'text-accent-foreground' : 'text-foreground'
              }`}
          >
            U
          </Text>
        </StyledPressable>

        {onOpenAudioList && (
          <>
            <View className="w-px h-6 bg-default mx-2" />
            <StyledPressable
              onPress={onOpenAudioList}
              accessibilityRole="button"
              accessibilityLabel={`${audioCount} audio recordings`}
              className={`px-3 py-1.5 rounded-md flex-row items-center gap-1 min-h-[44px] ${audioCount > 0 ? 'bg-warning/20' : 'bg-field-background'
                }`}
            >
              <Icon
                name="mic"
                size={14}
                className={audioCount > 0 ? 'text-warning' : 'text-muted'}
              />
              {audioCount > 0 && (
                <Text className="text-sm font-medium text-warning">{audioCount}</Text>
              )}
            </StyledPressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
