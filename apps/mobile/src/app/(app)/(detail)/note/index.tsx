import { RecentNoteCard } from '@/features/home/components/recent-note-card';
import { useNoteList } from '@/features/note/hooks/use-note-list';
import { deleteNote } from '@/features/note/services/delete-note';
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
            headerTitle: 'Notes',
            headerRight: () => (
                <Button size='sm' variant='ghost' onPress={() => router.push('/note/new')}>
                    <Button.Label className='text-accent font-semibold'>New</Button.Label>
                </Button>
            ),
        })
    }, [navigation, router])

    return (
        <View className='flex-1 bg-background'>
            <Input
                className='mx-4 mt-4'
                value={search}
                onChangeText={setSearch}
                placeholder='Search notes'
                returnKeyType='search'
            />
            <ScrollView className='flex-1' >
                <View className='px-4 pt-4 gap-4'>
                    {filteredNotes.length === 0 ? (
                        <Text className='text-muted text-sm'>No matching notes yet.</Text>
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
