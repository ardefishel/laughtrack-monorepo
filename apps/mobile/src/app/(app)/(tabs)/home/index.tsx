import { QuickNoteBar } from "@/features/home/components/quick-note-bar";
import { RecentNoteCard } from "@/features/home/components/recent-note-card";
import { RecentWorkCard } from "@/features/home/components/recent-work-card";
import { useRecentWorks } from "@/features/home/hooks/use-recent-works";
import { useKeyboardOffset } from "@/lib/use-keyboard-offset";
import { useRouter } from "expo-router";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NOTE_TABLE } from "@/database/constants";
import { noteModelToDomain } from "@/database/mappers/noteMapper";
import { Note as NoteModel } from "@/database/models/note";
import type { Note } from "@/types";
import type { RecentWork } from "@/domain/recent-work";

type WorkDetailPathname = '/(app)/(detail)/premise/[id]' | '/(app)/(detail)/bit/[id]' | '/(app)/(detail)/setlist/[id]'

const WORK_DETAIL_ROUTE: Record<RecentWork['type'], WorkDetailPathname> = {
  premise: '/(app)/(detail)/premise/[id]',
  bit: '/(app)/(detail)/bit/[id]',
  set: '/(app)/(detail)/setlist/[id]',
}

export default function Index() {
  const inset = useSafeAreaInsets()
  const router = useRouter()
  const database = useDatabase()
  const recentWorks = useRecentWorks()
  const keyboardOffset = useKeyboardOffset()

  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [isCreatingQuickNote, setIsCreatingQuickNote] = useState(false)

  const fetchRecentNotes = useCallback(async () => {
    const value = await database
      .get<NoteModel>(NOTE_TABLE)
      .query(Q.sortBy('updated_at', Q.desc), Q.take(6))
      .fetch()
    setRecentNotes(value.map(noteModelToDomain))
  }, [database])

  useEffect(() => {
    const subscription = database
      .get<NoteModel>(NOTE_TABLE)
      .query(Q.sortBy('updated_at', Q.desc), Q.take(6))
      .observe()
      .subscribe((notes: NoteModel[]) => {
        setRecentNotes(notes.map(noteModelToDomain))
      })

    return () => subscription.unsubscribe()
  }, [database])

  useFocusEffect(
    useCallback(() => {
      void fetchRecentNotes()
    }, [fetchRecentNotes]),
  )

  const handleQuickCreate = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    setIsCreatingQuickNote(true)
    try {
      await database.write(async () => {
        await database.get<NoteModel>(NOTE_TABLE).create((note) => {
          const now = Date.now()
          note.content = trimmed
          note.createdAt = new Date(now)
          note.updatedAt = new Date(now)
        })
      })
    } finally {
      setIsCreatingQuickNote(false)
    }
  }, [database])

  const openNote = useCallback((id: string) => {
    router.push(`/note/${id}`)
  }, [router])

  const openWork = useCallback((work: RecentWork) => {
    router.push({ pathname: WORK_DETAIL_ROUTE[work.type], params: { id: work.id } })
  }, [router])

  const handleDeleteNote = useCallback(async (id: string) => {
    await database.write(async () => {
      const note = await database.get<NoteModel>(NOTE_TABLE).find(id)
      await note.destroyPermanently()
    })
  }, [database])

  const quickNoteStyle = useMemo(() => ({
    marginBottom: keyboardOffset > 0 ? keyboardOffset + inset.bottom : 0,
  }), [inset.bottom, keyboardOffset])

  return (
    <View className="flex-1">
      <View className="bg-field px-4 pb-4" style={{ paddingTop: inset.top }}>
        <View className="flex flex-row">
          <Text className="text-2xl font-black italic text-accent">Laugh</Text>
          <Text className="text-2xl font-medium text-black dark:text-white">Track</Text>
        </View>
      </View>
      <ScrollView className="flex-1 text-default bg-background" contentContainerStyle={{ paddingBottom: inset.bottom + 100 }}>
        {recentWorks.length > 0 && (
          <View className="mt-4">
            <View className="flex flex-row items-center justify-between px-4">
              <Text className="text-foreground text-lg font-semibold">Recent Works</Text>
            </View>
            <ScrollView className="pl-4 py-4 " snapToAlignment="start" snapToInterval={260} decelerationRate="fast" horizontal showsHorizontalScrollIndicator={false}>
              {recentWorks.map((work) => (
                <RecentWorkCard key={work.id} variant={work.type} title={work.title} onPress={() => openWork(work)} />
              ))}
            </ScrollView>
          </View>
        )}
        <View className="mt-4">
          <View className="flex flex-row items-center justify-between px-4">
            <Text className="text-foreground text-lg font-semibold">Recent Notes</Text>
            {recentNotes.length > 0 && (
              <Pressable onPress={() => router.push("/note")}>
                <Text className="text-accent">See all</Text>
              </Pressable>
            )}
          </View>
          <View className="px-4 pt-4 gap-4">
            {recentNotes.length === 0 ? (
              <Text className="text-muted text-sm">No notes yet. Capture your first idea below.</Text>
            ) : (
              recentNotes.map((note) => (
                <RecentNoteCard
                  key={note.id}
                  note={note}
                  onPress={() => openNote(note.id)}
                  onDelete={() => handleDeleteNote(note.id)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0" style={quickNoteStyle}>
        <QuickNoteBar onSubmit={handleQuickCreate} isSubmitting={isCreatingQuickNote} />
      </View>
    </View>
  );
}
