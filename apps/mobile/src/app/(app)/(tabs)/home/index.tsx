import { QuickNoteBar } from "@/components/feature/home/quick-note-bar";
import { RecentNoteCard } from "@/components/feature/home/recent-note-card";
import { RecentWorkCard } from "@/components/feature/home/recent-work-card";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Q } from "@nozbe/watermelondb";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useCallback, useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NOTE_TABLE } from "@/database/constants";
import { Note as NoteModel } from "@/database/models/note";
import type { Note } from "@/types";

function toNote(model: NoteModel): Note {
  return {
    id: model.id,
    content: model.content,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  }
}

export default function Index() {
  const inset = useSafeAreaInsets()
  const router = useRouter()
  const database = useDatabase()

  const [recentNotes, setRecentNotes] = useState<Note[]>([])
  const [isCreatingQuickNote, setIsCreatingQuickNote] = useState(false)

  const loadRecentNotes = useCallback(async () => {
    const value = await database
      .get<NoteModel>(NOTE_TABLE)
      .query(Q.sortBy('updated_at', Q.desc), Q.take(6))
      .fetch()

    setRecentNotes(value.map(toNote))
  }, [database])

  useEffect(() => {
    const subscription = database
      .get<NoteModel>(NOTE_TABLE)
      .query(Q.sortBy('updated_at', Q.desc), Q.take(6))
      .observe()
      .subscribe((notes: NoteModel[]) => {
        setRecentNotes(notes.map(toNote))
      })

    return () => subscription.unsubscribe()
  }, [database])

  useFocusEffect(
    useCallback(() => {
      void loadRecentNotes()
    }, [loadRecentNotes]),
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

  const handleDeleteNote = useCallback(async (id: string) => {
    await database.write(async () => {
      const note = await database.get<NoteModel>(NOTE_TABLE).find(id)
      await note.destroyPermanently()
    })
  }, [database])

  return (
    <View className="flex-1">
      <View className="bg-field px-4 pb-4" style={{ paddingTop: inset.top }}>
        <View className="flex flex-row">
          <Text className="text-2xl font-black italic text-accent">Laugh</Text>
          <Text className="text-2xl font-medium text-black dark:text-white">Track</Text>
        </View>
      </View>
      <ScrollView className="flex-1 text-default bg-background" contentContainerStyle={{ paddingBottom: inset.bottom + 100 }}>
        <View className="mt-4">
          <View className="flex flex-row items-center justify-between px-4">
            <Text className="text-foreground text-lg font-semibold">Recent Works</Text>
          </View>
          <ScrollView className="pl-4 py-4 " snapToAlignment="start" snapToInterval={260} decelerationRate="fast" horizontal showsHorizontalScrollIndicator={false}>
            <RecentWorkCard variant="premise" title="Semua orang punya teman yang selalu telat tapi selalu bilang 'otw'." />
            <RecentWorkCard variant="premise" title="Orang Indo tuh unik, semua masalah diselesaikan dengan dua kata: 'santai aja'." />
            <RecentWorkCard variant="bit" title="Kenapa orang Indonesia selalu bilang 'nanti dulu'?" />
            <RecentWorkCard variant="set" title="Friday Night Jakarta Set" />
            <RecentWorkCard variant="premise" title="Semua orang punya teman yang selalu telat tapi selalu bilang 'otw'." />
          </ScrollView>
        </View>
        <View className="mt-4">
          <View className="flex flex-row items-center justify-between px-4">
            <Text className="text-foreground text-lg font-semibold">Recent Notes</Text>
            <Pressable onPress={() => router.push("/note")}>
              <Text className="text-accent">See all</Text>
            </Pressable>
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="absolute bottom-0 left-0 right-0"
      >
        <QuickNoteBar onSubmit={handleQuickCreate} isSubmitting={isCreatingQuickNote} />
      </KeyboardAvoidingView>
    </View>
  );
}
