import { Icon } from '@/components/ui/ion-icon';
import { useDetailHeader } from '@/features/material/hooks/use-detail-header';
import { useNoteForm } from '@/features/note/hooks/use-note-form';
import { useI18n } from '@/i18n';
import { useNavigation } from 'expo-router';
import { TextArea } from 'heroui-native';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

export default function NoteDetail() {
  const navigation = useNavigation('/(app)');
  const { t } = useI18n()
  const {
    isEditing,
    content,
    setContent,
    canSave,
    detailMeta,
    isSaving,
    canPromoteToPremise,
    handleSave,
    handlePromoteToPremise
  } = useNoteForm();

  useDetailHeader({
    navigation,
    title: isEditing ? t('notes.detail.editTitle') : t('notes.detail.newTitle'),
    onSave: handleSave,
    canSave,
    isEditing
  });

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView className="flex-1" contentContainerClassName="px-4 pt-6 pb-24 gap-5">
        <View className="gap-2">
          <Text className="text-muted text-xs tracking-[2px] font-semibold uppercase">{t('notes.detail.content')}</Text>
          <TextArea
            value={content}
            onChangeText={setContent}
            placeholder={t('notes.detail.placeholder')}
            className="min-h-[180px] text-[17px] leading-6"
          />
        </View>
        {detailMeta && <Text className="text-muted text-xs px-3">{detailMeta}</Text>}

        {canPromoteToPremise && (
          <View className="pt-4 border-t border-separator">
            <Pressable
              onPress={handlePromoteToPremise}
              disabled={isSaving || !content.trim()}
              className="flex-row items-center gap-3 px-3 py-3 rounded-xl active:opacity-70"
            >
              <View className="size-8 rounded-lg bg-accent/15 items-center justify-center">
                <Icon name="arrow-up-circle-outline" size={18} className="text-accent" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-[15px] font-medium">{t('notes.detail.promoteTitle')}</Text>
                <Text className="text-muted text-xs">{t('notes.detail.promoteDescription')}</Text>
              </View>
              <Icon name="chevron-forward" size={16} className="text-muted" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
