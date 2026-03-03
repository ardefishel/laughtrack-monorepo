import { Icon } from '@/components/ui/ion-icon'
import { Button, Dialog, Input } from 'heroui-native'
import { KeyboardAvoidingView, Pressable, Text, View } from 'react-native'

type AddSetlistItemDialogProps = {
    typeDialogOpen: boolean
    onTypeDialogOpenChange: (isOpen: boolean) => void
    noteDialogOpen: boolean
    onNoteDialogOpenChange: (isOpen: boolean) => void
    noteText: string
    onNoteTextChange: (text: string) => void
    onChooseBit: () => void
    onChooseNote: () => void
    onConfirmNote: () => void
}

export function AddSetlistItemDialog({
    typeDialogOpen,
    onTypeDialogOpenChange,
    noteDialogOpen,
    onNoteDialogOpenChange,
    noteText,
    onNoteTextChange,
    onChooseBit,
    onChooseNote,
    onConfirmNote,
}: AddSetlistItemDialogProps) {
    return (
        <>
            <Dialog isOpen={typeDialogOpen} onOpenChange={onTypeDialogOpenChange}>
                <Dialog.Portal>
                    <Dialog.Overlay />
                    <Dialog.Content>
                        <Dialog.Close className='absolute right-4 top-4 z-10' />
                        <Dialog.Title>Add to Setlist</Dialog.Title>
                        <Dialog.Description>What would you like to add?</Dialog.Description>

                        <View className='gap-3 mt-2'>
                            <Pressable
                                onPress={onChooseBit}
                                className='flex-row items-center gap-4 p-4 rounded-2xl bg-surface border border-separator active:opacity-70'
                            >
                                <View className='size-10 rounded-xl bg-accent/10 items-center justify-center'>
                                    <Icon name='mic-outline' size={20} className='text-accent' />
                                </View>

                                <View className='flex-1'>
                                    <Text className='text-foreground font-semibold text-[15px]'>Bit</Text>
                                    <Text className='text-muted text-xs mt-0.5'>Pick one or more bits from your library</Text>
                                </View>

                                <Icon name='chevron-forward' size={16} className='text-muted' />
                            </Pressable>

                            <Pressable
                                onPress={onChooseNote}
                                className='flex-row items-center gap-4 p-4 rounded-2xl bg-surface border border-separator active:opacity-70'
                            >
                                <View className='size-10 rounded-xl bg-blue-500/10 items-center justify-center'>
                                    <Icon name='document-text-outline' size={20} className='text-blue-500' />
                                </View>

                                <View className='flex-1'>
                                    <Text className='text-foreground font-semibold text-[15px]'>Note</Text>
                                    <Text className='text-muted text-xs mt-0.5'>Add a stage direction or reminder</Text>
                                </View>

                                <Icon name='chevron-forward' size={16} className='text-muted' />
                            </Pressable>
                        </View>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>

            <Dialog isOpen={noteDialogOpen} onOpenChange={onNoteDialogOpenChange}>
                <Dialog.Portal>
                    <Dialog.Overlay />
                    <KeyboardAvoidingView behavior='padding'>
                        <Dialog.Content>
                            <Dialog.Close className='absolute right-4 top-4 z-10' />
                            <Dialog.Title>Add Note</Dialog.Title>
                            <Dialog.Description>A stage direction or reminder between bits.</Dialog.Description>

                            <View className='mt-3 gap-4'>
                                <Input
                                    value={noteText}
                                    onChangeText={onNoteTextChange}
                                    placeholder='e.g. Pause here - let it breathe.'
                                    multiline
                                    numberOfLines={4}
                                    returnKeyType='default'
                                    className='min-h-[96px]'
                                />

                                <Button onPress={onConfirmNote} isDisabled={!noteText.trim()}>
                                    <Button.Label>Add Note</Button.Label>
                                </Button>
                            </View>
                        </Dialog.Content>
                    </KeyboardAvoidingView>
                </Dialog.Portal>
            </Dialog>
        </>
    )
}
