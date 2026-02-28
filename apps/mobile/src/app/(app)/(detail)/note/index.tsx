import { RecentNoteCard } from '@/components/feature/home/recent-note-card';
import { NOTE_TABLE } from '@/database/constants';
import { Note as NoteModel } from '@/database/models/note';
import type { Note } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useNavigation, useRouter } from 'expo-router';
import { Button, Input } from 'heroui-native';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

function toNote(model: NoteModel): Note {
    return {
        id: model.id,
        content: model.content,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt,
    }
}

export default function NoteList() {
    const router = useRouter()
    const navigation = useNavigation('/(app)')
    const database = useDatabase()
    const [search, setSearch] = useState('')
    const [notes, setNotes] = useState<Note[]>([])

    const loadNotes = useCallback(async () => {
        const value = await database
            .get<NoteModel>(NOTE_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .fetch()

        setNotes(value.map(toNote))
    }, [database])

    useEffect(() => {
        const subscription = database
            .get<NoteModel>(NOTE_TABLE)
            .query(Q.sortBy('updated_at', Q.desc))
            .observe()
            .subscribe((value: NoteModel[]) => {
                setNotes(value.map(toNote))
            })

        return () => subscription.unsubscribe()
    }, [database])

    useFocusEffect(
        useCallback(() => {
            void loadNotes()
        }, [loadNotes]),
    )

    const filteredNotes = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return notes

        return notes.filter((note) => note.content.toLowerCase().includes(term))
    }, [notes, search])

    const handleDeleteNote = async (id: string) => {
        await database.write(async () => {
            const note = await database.get<NoteModel>(NOTE_TABLE).find(id)
            await note.destroyPermanently()
        })
    }

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
