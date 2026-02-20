import React, { createContext, useCallback, useContext, useState } from 'react';

interface JokeFilterState {
    searchQuery: string;
    selectedTags: string[];
}

interface JokeFilterContextValue extends JokeFilterState {
    setSearchQuery: (query: string) => void;
    setSelectedTags: (tags: string[]) => void;
    toggleTag: (tag: string) => void;
    removeTag: (tag: string) => void;
    clearAll: () => void;
    activeFilterCount: number;
    hasActiveFilters: boolean;
}

const JokeFilterContext = createContext<JokeFilterContextValue | null>(null);

export function JokeFilterProvider({ children }: { children: React.ReactNode }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const toggleTag = useCallback((tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    }, []);

    const removeTag = useCallback((tag: string) => {
        setSelectedTags((prev) => prev.filter((t) => t !== tag));
    }, []);

    const clearAll = useCallback(() => {
        setSearchQuery('');
        setSelectedTags([]);
    }, []);

    const activeFilterCount = (searchQuery.trim() ? 1 : 0) + selectedTags.length;
    const hasActiveFilters = activeFilterCount > 0;

    return (
        <JokeFilterContext.Provider
            value={{
                searchQuery,
                selectedTags,
                setSearchQuery,
                setSelectedTags,
                toggleTag,
                removeTag,
                clearAll,
                activeFilterCount,
                hasActiveFilters,
            }}
        >
            {children}
        </JokeFilterContext.Provider>
    );
}

export function useJokeFilters(): JokeFilterContextValue {
    const context = useContext(JokeFilterContext);
    if (!context) {
        throw new Error('useJokeFilters must be used within a JokeFilterProvider');
    }
    return context;
}
