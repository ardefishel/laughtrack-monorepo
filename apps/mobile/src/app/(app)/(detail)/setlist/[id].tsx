import DraggableList from "@/components/ui/draggable-list";
import { Icon } from "@/components/ui/ion-icon";
import { BIT_TABLE, SETLIST_TABLE } from "@/database/constants";
import { bitContentToPreview, bitModelToDomain } from "@/database/mappers/bitMapper";
import { setlistModelToDomain } from "@/database/mappers/setlistMapper";
import { Bit as BitModel } from "@/database/models/bit";
import { Setlist as SetlistModel } from "@/database/models/setlist";
import type { SetlistItem } from "@/types";
import { useDatabase } from "@nozbe/watermelondb/react";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Button, Chip, Dialog, Input } from "heroui-native";
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useState
} from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    Text,
    View
} from "react-native";


// ─── Constants ────────────────────────────────────────────────────────────────

const BIT_STATUS_LABEL: Record<string, string> = {
    draft: "DRAFT",
    rework: "REWORK",
    tested: "TESTED",
    final: "FINAL",
    dead: "DEAD",
};

function parseStringArrayJson(value: string): string[] {
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((entry): entry is string => typeof entry === "string");
    } catch {
        return [];
    }
}

function toPersistedSetlistItems(items: SetlistItem[]): SetlistItem[] {
    return items
        .map((item): SetlistItem | null => {
            if (item.type === "bit") {
                return {
                    id: item.id,
                    type: "bit",
                    bitId: item.bitId,
                };
            }

            if (!item.setlistNote) return null;

            return {
                id: item.id,
                type: "set-note",
                setlistNote: {
                    id: item.setlistNote.id,
                    content: item.setlistNote.content,
                    createdAt: item.setlistNote.createdAt,
                    updatedAt: item.setlistNote.updatedAt,
                },
            };
        })
        .filter((item): item is SetlistItem => item !== null);
}

function uniqueSortedIds(values: string[]): string[] {
    return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function extractBitIds(items: SetlistItem[]): string[] {
    return uniqueSortedIds(
        items
            .filter((item): item is Extract<SetlistItem, { type: "bit" }> => item.type === "bit")
            .map((item) => item.bitId),
    );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SetlistDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const navigation = useNavigation("/(app)");
    const database = useDatabase();
    const isEditing = id !== "new";

    const [setlistState, setSetlistState] = useState<
        { setlist: SetlistModel; _key: number } | null
    >(null);
    const setlistModel = setlistState?.setlist ?? null;

    const [description, setDescription] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [items, setItems] = useState<SetlistItem[]>([]);
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const hydrateItemsWithBits = useCallback(
        async (sourceItems: SetlistItem[]): Promise<SetlistItem[]> => {
            const bitIds = extractBitIds(sourceItems);
            if (bitIds.length === 0) return sourceItems;

            const foundModels = await Promise.all(
                bitIds.map(async (bitId) => {
                    try {
                        return await database.get<BitModel>(BIT_TABLE).find(bitId);
                    } catch {
                        return null;
                    }
                }),
            );

            const bitById = new Map(
                foundModels
                    .filter((model): model is BitModel => model !== null)
                    .map((model) => [model.id, bitModelToDomain(model)]),
            );

            return sourceItems.map((item) => {
                if (item.type !== "bit") return item;
                return {
                    ...item,
                    bit: bitById.get(item.bitId),
                };
            });
        },
        [database],
    );

    useEffect(() => {
        if (!isEditing || !id) {
            setSetlistState(null);
            setDescription("");
            setTags([]);
            setItems([]);
            setUpdatedAt(null);
            return;
        }

        const subscription = database
            .get<SetlistModel>(SETLIST_TABLE)
            .findAndObserve(id)
            .subscribe((result: SetlistModel) => {
                const domainSetlist = setlistModelToDomain(result);
                setSetlistState({
                    setlist: result,
                    _key: result.updatedAt.getTime(),
                });
                setDescription(domainSetlist.description);
                setTags((domainSetlist.tags ?? []).map((tag) => tag.name));
                setUpdatedAt(domainSetlist.updatedAt);

                void hydrateItemsWithBits(domainSetlist.items).then((nextItems) => {
                    setItems(nextItems);
                });
            });

        return () => subscription.unsubscribe();
    }, [database, hydrateItemsWithBits, id, isEditing]);

    // Modal state
    const [typeDialogOpen, setTypeDialogOpen] = useState(false);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [noteText, setNoteText] = useState("");

    const { addedBits, addedBitsNonce } = useLocalSearchParams<{
        id: string;
        addedBits?: string;
        addedBitsNonce?: string;
    }>();
    useEffect(() => {
        if (!addedBitsNonce) return;
        if (!addedBits) {
            router.setParams({ addedBits: "", addedBitsNonce: "" });
            return;
        }
        const incomingIds = addedBits.split(",").filter(Boolean);
        if (incomingIds.length === 0) {
            router.setParams({ addedBits: "", addedBitsNonce: "" });
            return;
        }
        void (async () => {
            const foundModels = await Promise.all(
                incomingIds.map(async (bitId) => {
                    try {
                        return await database.get<BitModel>(BIT_TABLE).find(bitId);
                    } catch {
                        return null;
                    }
                }),
            );

            const foundBits = foundModels
                .filter((model): model is BitModel => model !== null)
                .map(bitModelToDomain);

            const newItems: SetlistItem[] = foundBits.map((bit, idx) => ({
                id: `new-bit-${Date.now()}-${idx}`,
                type: "bit" as const,
                bitId: bit.id,
                bit,
            }));

            setItems((prev) => {
                const existingBitIds = new Set(
                    prev
                        .filter((item): item is Extract<SetlistItem, { type: "bit" }> => item.type === "bit")
                        .map((item) => item.bitId),
                );
                const dedupedIncomingItems = newItems.filter(
                    (item): item is Extract<SetlistItem, { type: "bit" }> =>
                        item.type === "bit" && !existingBitIds.has(item.bitId),
                );
                return [...prev, ...dedupedIncomingItems];
            });
            router.setParams({ addedBits: "", addedBitsNonce: "" });
        })();
    }, [addedBits, addedBitsNonce, database]);

    const canSave = description.trim().length > 0 && !isSaving;
    const bitCount = items.filter((i) => i.type === "bit").length;

    // ── Handlers ──────────────────────────────────────────────────────────────

    const handleSave = useCallback(async () => {
        const trimmedDescription = description.trim();
        if (!trimmedDescription || isSaving) return;

        const persistedItems = toPersistedSetlistItems(items);
        const nextBitIds = extractBitIds(persistedItems);

        setIsSaving(true);
        try {
            await database.write(async () => {
                const now = new Date();

                if (isEditing && id && setlistModel) {
                    const previousBitIds = extractBitIds(setlistModelToDomain(setlistModel).items);

                    await setlistModel.update((setlist) => {
                        setlist.description = trimmedDescription;
                        setlist.tagsJson = JSON.stringify(tags);
                        setlist.itemsJson = JSON.stringify(persistedItems);
                        setlist.updatedAt = now;
                    });

                    const nextBitIdSet = new Set(nextBitIds);
                    const previousBitIdSet = new Set(previousBitIds);
                    const touchedBitIds = uniqueSortedIds([...nextBitIds, ...previousBitIds]);

                    for (const bitId of touchedBitIds) {
                        try {
                            const bit = await database.get<BitModel>(BIT_TABLE).find(bitId);
                            const currentSetlistIds = uniqueSortedIds(parseStringArrayJson(bit.setlistIdsJson));
                            const shouldContain = nextBitIdSet.has(bitId);
                            const previouslyContained = previousBitIdSet.has(bitId);

                            if (!shouldContain && !previouslyContained) continue;

                            const nextSetlistIds = shouldContain
                                ? uniqueSortedIds([...currentSetlistIds, id])
                                : currentSetlistIds.filter((setlistId) => setlistId !== id);

                            if (
                                nextSetlistIds.length === currentSetlistIds.length &&
                                nextSetlistIds.every((value, index) => value === currentSetlistIds[index])
                            ) {
                                continue;
                            }

                            await bit.update((model) => {
                                model.setlistIdsJson = JSON.stringify(nextSetlistIds);
                                model.updatedAt = now;
                            });
                        } catch {
                            continue;
                        }
                    }

                    return;
                }

                const createdSetlist = await database.get<SetlistModel>(SETLIST_TABLE).create((setlist: SetlistModel) => {
                    setlist.description = trimmedDescription;
                    setlist.tagsJson = JSON.stringify(tags);
                    setlist.itemsJson = JSON.stringify(persistedItems);
                    setlist.createdAt = now;
                    setlist.updatedAt = now;
                });

                for (const bitId of nextBitIds) {
                    try {
                        const bit = await database.get<BitModel>(BIT_TABLE).find(bitId);
                        const currentSetlistIds = uniqueSortedIds(parseStringArrayJson(bit.setlistIdsJson));
                        const nextSetlistIds = uniqueSortedIds([...currentSetlistIds, createdSetlist.id]);

                        if (
                            nextSetlistIds.length === currentSetlistIds.length &&
                            nextSetlistIds.every((value, index) => value === currentSetlistIds[index])
                        ) {
                            continue;
                        }

                        await bit.update((model) => {
                            model.setlistIdsJson = JSON.stringify(nextSetlistIds);
                            model.updatedAt = now;
                        });
                    } catch {
                        continue;
                    }
                }
            });

            router.back();
        } finally {
            setIsSaving(false);
        }
    }, [database, description, id, isEditing, isSaving, items, setlistModel, tags]);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerTitle: isEditing ? "Setlist" : "New Setlist",
            headerRight: () => (
                <Button
                    size="sm"
                    variant="ghost"
                    onPress={handleSave}
                    isDisabled={!canSave}
                >
                    <Button.Label className="text-accent font-semibold">
                        {isEditing ? "Save" : "Create"}
                    </Button.Label>
                </Button>
            ),
        });
    }, [navigation, isEditing, canSave, handleSave]);

    const handleAddTag = () => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setTagInput("");
    };

    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
    };

    // Type picker → open formSheet modal for bit selection
    const handleChooseBit = () => {
        setTypeDialogOpen(false);
        const selected = items
            .filter((item): item is Extract<SetlistItem, { type: "bit" }> => item.type === "bit")
            .map((item) => item.bitId)
            .join(",");
        router.push({
            pathname: "/(app)/(modal)/setlist-add-bit",
            params: {
                selected,
            },
        });
    };

    // Type picker → note dialog
    const handleChooseNote = () => {
        setTypeDialogOpen(false);
        setNoteText("");
        setNoteDialogOpen(true);
    };

    // Confirm adding note
    const handleConfirmNote = () => {
        const trimmed = noteText.trim();
        if (!trimmed) return;
        const newItem: SetlistItem = {
            id: `new-note-${Date.now()}`,
            type: "set-note",
            setlistNote: {
                id: `n-${Date.now()}`,
                content: trimmed,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        };
        setItems((prev) => [...prev, newItem]);
        setNoteDialogOpen(false);
        setNoteText("");
    };
    const ListHeader = () => (
        <View className="gap-6 px-4 pt-6">
            {/* Description */}
            <View className="gap-2">
                <Text className="text-muted text-xs tracking-[2px] font-semibold uppercase">
                    Description
                </Text>
                <Input
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g. Friday Club Night — 20 min set"
                />
            </View>

            {/* Tags */}
            <View className="gap-3">
                <Text className="text-muted text-xs tracking-[2px] font-semibold uppercase">
                    Tags
                </Text>
                {tags.length > 0 && (
                    <View className="flex-row flex-wrap gap-2">
                        {tags.map((tag) => (
                            <Chip
                                key={tag}
                                variant="secondary"
                                color="default"
                                onPress={() => handleRemoveTag(tag)}
                            >
                                <Chip.Label className="text-sm">#{tag}</Chip.Label>
                                <Icon name="close" size={12} className="text-muted" />
                            </Chip>
                        ))}
                    </View>
                )}
                <View className="flex-row gap-2">
                    <Input
                        className="flex-1"
                        value={tagInput}
                        onChangeText={setTagInput}
                        placeholder="Add a tag..."
                        returnKeyType="done"
                        onSubmitEditing={handleAddTag}
                    />
                    <Button
                        isIconOnly
                        variant="secondary"
                        onPress={handleAddTag}
                        isDisabled={!tagInput.trim()}
                    >
                        <Icon name="add" size={20} className="text-accent" />
                    </Button>
                </View>
            </View>

            {/* Items header row */}
            <View className="flex-row items-center justify-between">
                <Text className="text-muted text-xs tracking-[2px] font-semibold uppercase">
                    Items ({bitCount} {bitCount === 1 ? "bit" : "bits"})
                </Text>
                <View className="flex-row items-center gap-1">
                    {items.length > 0 && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onPress={() =>
                                router.push({
                                    pathname: "/(app)/(detail)/setlist/reader",
                                    params: {
                                        title: description || "Reader",
                                        items: JSON.stringify(items),
                                    },
                                })
                            }
                        >
                            <Icon name="book-outline" size={16} className="text-accent" />
                            <Button.Label className="text-accent text-xs">
                                Read
                            </Button.Label>
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => setTypeDialogOpen(true)}
                    >
                        <Icon name="add-outline" size={16} className="text-accent" />
                        <Button.Label className="text-accent text-xs">
                            Add Set Item
                        </Button.Label>
                    </Button>
                </View>
            </View>
        </View>
    );


    return (
        <>
            <KeyboardAvoidingView
                className="flex-1 bg-background"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={100}
            >
                <ListHeader />
                <DraggableList
                    data={items}
                    onDragEnd={setItems}
                    onDelete={(item) => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                    renderItemContent={(item) => {
                        if (item.type === "bit") {
                            const preview = item.bit
                                ? bitContentToPreview(item.bit.content)
                                : null;
                            return (
                                <View className="gap-1.5">
                                    <Text className="text-muted text-[10px] tracking-[2px] font-semibold">
                                        {BIT_STATUS_LABEL[item.bit?.status ?? "draft"] ?? "DRAFT"}
                                    </Text>
                                    <Text className="text-foreground text-[16px] font-medium leading-5" numberOfLines={1}>
                                        {preview?.title || "Untitled bit"}
                                    </Text>
                                    {preview?.description ? (
                                        <Text className="text-muted text-[13px] leading-4" numberOfLines={1}>
                                            {preview.description}
                                        </Text>
                                    ) : null}
                                </View>
                            );
                        }
                        return (
                            <View className="gap-1.5">
                                <Text className="text-muted text-[10px] tracking-[2px] font-semibold">NOTE</Text>
                                <View className="flex-row items-center gap-2">
                                    <Icon name="document-text-outline" size={14} className="text-blue-500" />
                                    <Text className="text-foreground text-[14px]" numberOfLines={1}>
                                        {item.setlistNote?.content ?? "Note"}
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />
            </KeyboardAvoidingView>

            {/* ── Stage 1: Type Picker Dialog ─────────────────────────────── */}
            <Dialog isOpen={typeDialogOpen} onOpenChange={setTypeDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay />
                    <Dialog.Content>
                        <Dialog.Close className="absolute right-4 top-4 z-10" />
                        <Dialog.Title>Add to Setlist</Dialog.Title>
                        <Dialog.Description>What would you like to add?</Dialog.Description>

                        <View className="gap-3 mt-2">
                            {/* Bit option */}
                            <Pressable
                                onPress={handleChooseBit}
                                className="flex-row items-center gap-4 p-4 rounded-2xl bg-surface border border-separator active:opacity-70"
                            >
                                <View className="size-10 rounded-xl bg-accent/10 items-center justify-center">
                                    <Icon name="mic-outline" size={20} className="text-accent" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold text-[15px]">
                                        Bit
                                    </Text>
                                    <Text className="text-muted text-xs mt-0.5">
                                        Pick one or more bits from your library
                                    </Text>
                                </View>
                                <Icon name="chevron-forward" size={16} className="text-muted" />
                            </Pressable>

                            {/* Note option */}
                            <Pressable
                                onPress={handleChooseNote}
                                className="flex-row items-center gap-4 p-4 rounded-2xl bg-surface border border-separator active:opacity-70"
                            >
                                <View className="size-10 rounded-xl bg-blue-500/10 items-center justify-center">
                                    <Icon
                                        name="document-text-outline"
                                        size={20}
                                        className="text-blue-500"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-foreground font-semibold text-[15px]">
                                        Note
                                    </Text>
                                    <Text className="text-muted text-xs mt-0.5">
                                        Add a stage direction or reminder
                                    </Text>
                                </View>
                                <Icon name="chevron-forward" size={16} className="text-muted" />
                            </Pressable>
                        </View>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog>

            {/* ── Stage 2b: Add Note Dialog ───────────────────────────────── */}
            <Dialog isOpen={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <Dialog.Portal>
                    <Dialog.Overlay />
                    <KeyboardAvoidingView behavior="padding">
                        <Dialog.Content>
                            <Dialog.Close className="absolute right-4 top-4 z-10" />
                            <Dialog.Title>Add Note</Dialog.Title>
                            <Dialog.Description>
                                A stage direction or reminder between bits.
                            </Dialog.Description>

                            <View className="mt-3 gap-4">
                                <Input
                                    value={noteText}
                                    onChangeText={setNoteText}
                                    placeholder="e.g. Pause here — let it breathe."
                                    multiline
                                    numberOfLines={4}
                                    returnKeyType="default"
                                    className="min-h-[96px]"
                                />

                                <Button
                                    onPress={handleConfirmNote}
                                    isDisabled={!noteText.trim()}
                                >
                                    <Button.Label>Add Note</Button.Label>
                                </Button>
                            </View>
                        </Dialog.Content>
                    </KeyboardAvoidingView>
                </Dialog.Portal>
            </Dialog>
        </>
    );
}
