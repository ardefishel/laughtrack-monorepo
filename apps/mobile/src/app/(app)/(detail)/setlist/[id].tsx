import { AddSetlistItemDialog } from '@/features/setlist/components/add-setlist-item-dialog'
import { SetlistItemContent } from '@/features/setlist/components/setlist-item-content'
import { SetlistListHeader } from '@/features/setlist/components/setlist-list-header'
import DraggableList from '@/components/ui/draggable-list'
import { useSetlistForm } from '@/features/setlist/hooks/use-setlist-form'
import { useNavigation } from 'expo-router'
import { Button } from 'heroui-native'
import { useLayoutEffect } from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'

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

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: isEditing ? 'Setlist' : 'New Setlist',
            headerRight: () => (
                <Button size='sm' variant='ghost' onPress={handleSave} isDisabled={!canSave}>
                    <Button.Label className='text-accent font-semibold'>
                        {isEditing ? 'Save' : 'Create'}
                    </Button.Label>
                </Button>
            ),
        })
    }, [navigation, isEditing, canSave, handleSave])

    return (
        <>
            <KeyboardAvoidingView
                className='flex-1 bg-background'
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={100}
            >
                <SetlistListHeader
                    description={description}
                    onDescriptionChange={setDescription}
                    tags={tags}
                    onTagsChange={setTags}
                    items={items}
                    bitCount={bitCount}
                    onOpenTypeDialog={() => setTypeDialogOpen(true)}
                />

                <DraggableList
                    data={items}
                    onDragEnd={setItems}
                    onDelete={(item) => setItems((prev) => prev.filter((entry) => entry.id !== item.id))}
                    renderItemContent={(item) => <SetlistItemContent item={item} />}
                />
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
