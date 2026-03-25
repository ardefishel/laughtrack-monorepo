import { Icon } from '@/components/ui/ion-icon';
import { RecentNoteCard } from '@/features/home/components/recent-note-card';
import { useNoteList } from '@/features/note/hooks/use-note-list';
import { deleteNote } from '@/features/note/services/delete-note';
import { useI18n } from '@/i18n';
import { useFocusEffect } from '@react-navigation/native';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useNavigation, useRouter } from 'expo-router';
import { Button, Input } from 'heroui-native';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Keyboard, Platform, Text, View, type ViewStyle } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

export default function NoteList() {
    const router = useRouter()
    const navigation = useNavigation('/(app)')
    const { t } = useI18n()
    const database = useDatabase()
    const [search, setSearch] = useState('')
    const { notes, refresh } = useNoteList()
    const [keyboardHeight, setKeyboardHeight] = useState(0)

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

        const showSub = Keyboard.addListener(showEvent, (e) => {
            setKeyboardHeight(e.endCoordinates.height)
        })
        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0)
        })

        return () => {
            showSub.remove()
            hideSub.remove()
        }
    }, [])

    const fabStyle = useMemo<ViewStyle>(() => ({
        marginBottom: keyboardHeight + 20,
    }), [keyboardHeight])

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
        })
    }, [navigation, t])

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
                <View className='px-4 pt-4 pb-20 gap-4'>
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

            <Button className='absolute right-0 bottom-0 mr-4' style={fabStyle} onPress={() => router.push('/note/new')} accessibilityLabel={t('notes.list.new')}>
                <Icon name='add-outline' size={20} />
                <Button.Label>{t('notes.list.new')}</Button.Label>
            </Button>
        </View>
    )
}
