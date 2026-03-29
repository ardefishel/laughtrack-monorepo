import { Icon } from '@/components/ui/ion-icon'
import { bulkCreateNotes, parseNotesFromText } from '@/features/note/services/bulk-create-notes'
import { useI18n } from '@/i18n'
import { uiLogger } from '@/lib/loggers'
import { useRouter } from 'expo-router'
import { useDatabase } from '@nozbe/watermelondb/react'
import { Button, Separator, TextArea } from 'heroui-native'
import { useCallback, useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

export default function NoteBulkImportModal() {
    const router = useRouter()
    const database = useDatabase()
    const { t } = useI18n()

    const [rawText, setRawText] = useState('')
    const [isImporting, setIsImporting] = useState(false)

    const parsedNotes = useMemo(() => {
        if (!rawText.trim()) return []
        return parseNotesFromText(rawText)
    }, [rawText])

    const noteCount = parsedNotes.length

    const handleImport = useCallback(async () => {
        if (noteCount === 0 || isImporting) return

        setIsImporting(true)
        try {
            await bulkCreateNotes(database, parsedNotes)
            router.back()
        } catch (error) {
            uiLogger.error('Failed to bulk import notes', error)
        } finally {
            setIsImporting(false)
        }
    }, [database, isImporting, noteCount, parsedNotes, router])

    return (
        <View className="flex-1">
            <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-field">
                <Button variant="ghost" onPress={() => router.back()} accessibilityLabel={t('notes.bulkImport.cancel')}>
                    <Button.Label>{t('notes.bulkImport.cancel')}</Button.Label>
                </Button>
                <Text className="text-foreground text-lg font-semibold">{t('notes.bulkImport.title')}</Text>
                <Button
                    variant="ghost"
                    onPress={handleImport}
                    isDisabled={noteCount === 0 || isImporting}
                    accessibilityLabel={noteCount === 1 ? t('notes.bulkImport.importButtonSingular') : t('notes.bulkImport.importButton', { count: noteCount })}
                >
                    <Button.Label className="text-accent font-semibold">
                        {noteCount === 1 ? t('notes.bulkImport.importButtonSingular') : t('notes.bulkImport.importButton', { count: noteCount })}
                    </Button.Label>
                </Button>
            </View>
            <Separator />

            <ScrollView className="flex-1" contentContainerClassName="px-6 pt-6 pb-8" keyboardShouldPersistTaps="handled">
                <View className="gap-2 mb-4">
                    <Text className="text-muted text-xs font-semibold tracking-[2px] uppercase">{t('notes.bulkImport.pasteLabel')}</Text>
                    <TextArea
                        value={rawText}
                        onChangeText={setRawText}
                        placeholder={t('notes.bulkImport.inputPlaceholder')}
                        className="min-h-[160px] text-[15px] leading-[22px]"
                        editable={!isImporting}
                    />
                </View>

                {noteCount > 0 && (
                    <View className="gap-3">
                        <Text className="text-muted text-xs font-semibold tracking-[2px] uppercase">
                            {noteCount === 1 ? t('notes.bulkImport.noteCountSingular') : t('notes.bulkImport.noteCount', { count: noteCount })}
                        </Text>

                        {parsedNotes.map((note, index) => (
                            <View key={index} className="bg-field rounded-xl px-4 py-3 border border-separator">
                                <Text className="text-foreground text-[15px] leading-[22px]" numberOfLines={6}>
                                    {note}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {rawText.trim().length > 0 && noteCount === 0 && (
                    <View className="items-center py-4">
                        <Text className="text-muted text-sm text-center">{t('notes.bulkImport.empty')}</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}
