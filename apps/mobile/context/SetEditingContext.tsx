import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { JokeSetStatus } from '@/lib/types';
import { SetJokeItem } from '@/lib/mocks';

type SetEditingMode = 'edit' | 'create';

interface SetDetails {
  title: string;
  description: string;
  duration: string;
  place: string;
  status: JokeSetStatus;
}

interface SetEditingContextType {
  mode: SetEditingMode;
  pendingAddPosition: string | null | undefined;
  setPendingAddPosition: (afterId: string | null | undefined) => void;
  hasStarted: boolean;
  setHasStarted: (value: boolean) => void;
  items: SetJokeItem[];
  setItems: (items: SetJokeItem[] | ((prev: SetJokeItem[]) => SetJokeItem[])) => void;
  setDetails: SetDetails;
  updateSetDetails: (details: Partial<SetDetails>) => void;
  resetNewSet: () => void;
  editingSetId: string | null;
  setEditingSetId: (id: string | null) => void;
}

const defaultSetDetails: SetDetails = {
  title: 'Untitled Set',
  description: '',
  duration: '',
  place: '',
  status: 'draft',
};

const SetEditingContext = createContext<SetEditingContextType | undefined>(undefined);

export function SetEditingProvider({
  children,
  mode,
}: {
  children: ReactNode;
  mode: SetEditingMode;
}) {
  const [pendingAddPosition, setPendingAddPositionRaw] = useState<string | null | undefined>(undefined);
  const [hasStarted, setHasStarted] = useState(false);
  const [items, setItems] = useState<SetJokeItem[]>([]);
  const [setDetails, setSetDetails] = useState<SetDetails>(defaultSetDetails);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);

  const setPendingAddPosition = useCallback((afterId: string | null | undefined) => {
    setPendingAddPositionRaw(afterId);
  }, []);

  const updateSetDetails = useCallback((details: Partial<SetDetails>) => {
    setSetDetails((prev) => ({ ...prev, ...details }));
  }, []);

  const resetNewSet = useCallback(() => {
    setHasStarted(false);
    setItems([]);
    setSetDetails(defaultSetDetails);
    setPendingAddPosition(undefined);
  }, [setPendingAddPosition]);

  return (
    <SetEditingContext.Provider
      value={{
        mode,
        pendingAddPosition,
        setPendingAddPosition,
        hasStarted,
        setHasStarted,
        items,
        setItems,
        setDetails,
        updateSetDetails,
        resetNewSet,
        editingSetId,
        setEditingSetId,
      }}
    >
      {children}
    </SetEditingContext.Provider>
  );
}

export function useSetEditing(): SetEditingContextType {
  const context = useContext(SetEditingContext);
  if (context === undefined) {
    throw new Error('useSetEditing must be used within a SetEditingProvider');
  }
  return context;
}

export { SetEditingMode };
export type { SetDetails };
