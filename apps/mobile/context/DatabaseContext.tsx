import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { Database } from '@nozbe/watermelondb';
import { database } from '@/db';
import { dbLogger } from '@/lib/loggers';

interface DatabaseContextType {
  database: Database;
  resetDatabase: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [dbKey, setDbKey] = useState(0);

  const resetDatabase = useCallback(async () => {
    dbLogger.info('[DatabaseContext] Resetting database...');
    try {
      await database.write(async () => {
        await database.unsafeResetDatabase();
      });
      setDbKey((k) => k + 1);
      dbLogger.info('[DatabaseContext] Database reset complete, remounting consumers');
    } catch (err) {
      dbLogger.error('[DatabaseContext] Failed to reset database:', err);
    }
  }, []);

  return (
    <DatabaseContext.Provider key={dbKey} value={{ database, resetDatabase }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): DatabaseContextType {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
