import { RecentNoteCard } from '@/features/home/components/recent-note-card';
import { useNoteList } from '@/features/note/hooks/use-note-list';
import { deleteNote } from '@/features/note/services/delete-note';
import { useI18n } from '@/i18n';
import { useFocusEffect } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useNavigation, useRouter } from 'expo-router';
import { Button, Input } from 'heroui-native';
import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function NoteList() {
    const router = useRouter()
    const navigation = useNavigation('/(app)')
    const { t } = useI18n()
    const database = useDatabase()
    const [search, setSearch] = useState('')
    const { notes, refresh } = useNoteList()

    useFocusEffect(
        useCallback(() => {
            void refresh()
        }, [refresh]),
    )

    const filteredNotes = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return notes

        return notes.filter((note) => note.content.toLowerCase().includes(term))
    }, [notes, search])

    const handleDeleteNote = useCallback(async (id: string) => {
        await deleteNote(database, id)
    }, [database])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: t('notes.list.title'),
            headerRight: () => (
                <Button size='sm' variant='ghost' onPress={() => router.push('/note/new')} accessibilityLabel={t('notes.list.new')}>
                    <Button.Label className='text-accent font-semibold'>{t('notes.list.new')}</Button.Label>
                </Button>
            ),
        })
    }, [navigation, router, t])

    return (
        <View className='flex-1 bg-background'>
            <Input
                className='mx-4 mt-4'
                value={search}
                onChangeText={setSearch}
                placeholder={t('notes.list.searchPlaceholder')}
                accessibilityLabel={t('notes.list.searchPlaceholder')}
                returnKeyType='search'
            />
            <ScrollView className='flex-1' >
                <View className='px-4 pt-4 gap-4'>
                    {filteredNotes.length === 0 ? (
                        <Text className='text-muted text-sm'>{t('notes.list.noMatches')}</Text>
                    ) : (
                        filteredNotes.map((note) => (
                            <RecentNoteCard
                                key={note.id}
                                note={note}
                                onPress={() => router.push(`/note/${note.id}`)}
                                onDelete={() => handleDeleteNote(note.id)}
                            />
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    )
}
