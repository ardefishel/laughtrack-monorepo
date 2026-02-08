import { Pressable, View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { withUniwind } from 'uniwind';
import { Ionicons } from '@expo/vector-icons';

const StyledPressable = withUniwind(Pressable);
const StyledIonicons = withUniwind(Ionicons);

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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View className="flex-row items-center gap-2 p-3 border-t border-default bg-surface">
        <StyledPressable
          onPress={onH1}
          className={`px-3 py-1.5 rounded-md ${
            activeStyles.h1 ? 'bg-primary' : 'bg-field-background'
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              activeStyles.h1 ? 'text-primary-foreground' : 'text-foreground'
            }`}
          >
            H1
          </Text>
        </StyledPressable>

        <StyledPressable
          onPress={onH2}
          className={`px-3 py-1.5 rounded-md ${
            activeStyles.h2 ? 'bg-primary' : 'bg-field-background'
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              activeStyles.h2 ? 'text-primary-foreground' : 'text-foreground'
            }`}
          >
            H2
          </Text>
        </StyledPressable>

        <StyledPressable
          onPress={onParagraph}
          className={`px-3 py-1.5 rounded-md ${
            isParagraph ? 'bg-primary' : 'bg-field-background'
          }`}
        >
          <Text
            className={`text-sm ${
              isParagraph ? 'text-primary-foreground' : 'text-foreground'
            }`}
          >
            P
          </Text>
        </StyledPressable>

        <View className="w-px h-6 bg-default mx-2" />

        <StyledPressable
          onPress={onBold}
          className={`px-3 py-1.5 rounded-md ${
            activeStyles.bold ? 'bg-primary' : 'bg-field-background'
          }`}
        >
          <Text
            className={`text-sm font-bold ${
              activeStyles.bold ? 'text-primary-foreground' : 'text-foreground'
            }`}
          >
            B
          </Text>
        </StyledPressable>

        <StyledPressable
          onPress={onItalic}
          className={`px-3 py-1.5 rounded-md ${
            activeStyles.italic ? 'bg-primary' : 'bg-field-background'
          }`}
        >
          <Text
            className={`text-sm italic ${
              activeStyles.italic ? 'text-primary-foreground' : 'text-foreground'
            }`}
          >
            I
          </Text>
        </StyledPressable>

        <StyledPressable
          onPress={onUnderline}
          className={`px-3 py-1.5 rounded-md ${
            activeStyles.underline ? 'bg-primary' : 'bg-field-background'
          }`}
        >
          <Text
            className={`text-sm underline ${
              activeStyles.underline ? 'text-primary-foreground' : 'text-foreground'
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
              className={`px-3 py-1.5 rounded-md flex-row items-center gap-1 ${
                audioCount > 0 ? 'bg-warning/20' : 'bg-field-background'
              }`}
            >
              <StyledIonicons
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
