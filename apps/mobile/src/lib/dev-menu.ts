import { database } from '@/database'
import { seedMockData } from '@/database/seed-mock-data'
import { dbLogger } from '@/lib/loggers'
import Constants, { ExecutionEnvironment } from 'expo-constants'
import * as DevClient from 'expo-dev-client'

let hasRegisteredDevMenuItems = false
let isSeedingMockData = false

function isSupportedDevMenuEnvironment(): boolean {
    return __DEV__ && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient
}

function seedMockDataFromDevMenu(): void {
    if (isSeedingMockData) {
        dbLogger.info('Dev menu action skipped: mock data seeding already in progress')
        return
    }

    isSeedingMockData = true
    dbLogger.info('Dev menu action: seeding mock data')

    void seedMockData(database)
        .catch((error: unknown) => dbLogger.error('Failed to seed mock data', error))
        .finally(() => {
            isSeedingMockData = false
        })
}

export function registerAppDevMenuItems(): void {
    if (!isSupportedDevMenuEnvironment() || hasRegisteredDevMenuItems) return

    hasRegisteredDevMenuItems = true

    void DevClient.registerDevMenuItems([
        {
            name: 'Seed mock data',
            shouldCollapse: true,
            callback: seedMockDataFromDevMenu,
        },
    ]).catch((error: unknown) => {
        hasRegisteredDevMenuItems = false
        dbLogger.error('Failed to register dev menu items', error)
    })
}
