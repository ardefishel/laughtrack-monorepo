import { useEffect } from 'react'
import { InteractionManager } from 'react-native'
import { database } from '@/database'
import { reconcilePremiseBitLinks } from '@/features/premise/services/premise-bit-links'
import { reconcileSetlistBitLinks } from '@/features/setlist/services/setlist-bit-links'
import { registerAppDevMenuItems } from '@/lib/dev-menu'
import { dbLogger } from '@/lib/loggers'

export function useStartupTasks() {
    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            void reconcilePremiseBitLinks(database)
                .then((count) => dbLogger.info(`Reconciled premise-bit links: ${count} updated`))
                .catch((error: unknown) => dbLogger.error('Failed to reconcile premise-bit links', error))

            void reconcileSetlistBitLinks(database)
                .then((count) => dbLogger.info(`Reconciled setlist-bit links: ${count} updated`))
                .catch((error: unknown) => dbLogger.error('Failed to reconcile setlist-bit links', error))
        })

        return () => task.cancel()
    }, [])

    useEffect(() => {
        registerAppDevMenuItems()
    }, [])
}
