import { AddSetlistItemDialog } from '@/features/setlist/components/add-setlist-item-dialog'
import { SetlistItemContent } from '@/features/setlist/components/setlist-item-content'
import { SetlistListHeader } from '@/features/setlist/components/setlist-list-header'
import DraggableList from '@/components/ui/draggable-list'
import { useDetailHeader } from '@/features/material/hooks/use-detail-header'
import { useSetlistForm } from '@/features/setlist/hooks/use-setlist-form'
import { useNavigation } from 'expo-router'
import { useMemo } from 'react'
import { KeyboardAvoidingView, Platform, View } from 'react-native'

export default function SetlistDetailScreen() {
    const navigation = useNavigation('/(app)')

    const {
        isEditing,
        description,
        setDescription,
        tags,
        setTags,
        items,
        setItems,
        canSave,
        bitCount,
        handleSave,
        typeDialogOpen,
        setTypeDialogOpen,
        noteDialogOpen,
        setNoteDialogOpen,
        noteText,
        setNoteText,
        handleChooseBit,
        handleChooseNote,
        handleConfirmNote,
    } = useSetlistForm()

    const listHeader = useMemo(
        () => (
            <SetlistListHeader
                description={description}
                onDescriptionChange={setDescription}
                tags={tags}
                onTagsChange={setTags}
                items={items}
                bitCount={bitCount}
                onOpenTypeDialog={() => setTypeDialogOpen(true)}
            />
        ),
        [bitCount, description, items, setDescription, setTags, setTypeDialogOpen, tags],
    )

    useDetailHeader({
        navigation,
        title: isEditing ? 'Setlist' : 'New Setlist',
        onSave: handleSave,
        canSave,
        isEditing,
    })

    return (
        <>
            <KeyboardAvoidingView
                className='flex-1 bg-background'
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
            >
                <View className='flex-1'>
                    <DraggableList
                        data={items}
                        onDragEnd={setItems}
                        onDelete={(item) => setItems((prev) => prev.filter((entry) => entry.id !== item.id))}
                        renderItemContent={(item) => <SetlistItemContent item={item} />}
                        ListHeaderComponent={listHeader}
                    />
                </View>
            </KeyboardAvoidingView>

            <AddSetlistItemDialog
                typeDialogOpen={typeDialogOpen}
                onTypeDialogOpenChange={setTypeDialogOpen}
                noteDialogOpen={noteDialogOpen}
                onNoteDialogOpenChange={setNoteDialogOpen}
                noteText={noteText}
                onNoteTextChange={setNoteText}
                onChooseBit={handleChooseBit}
                onChooseNote={handleChooseNote}
                onConfirmNote={handleConfirmNote}
            />
        </>
    )
}
