import type { Database } from '@nozbe/watermelondb'
import { dbLogger } from '@/lib/loggers'
import { PREMISE_TABLE } from '../constants'
import { Premise as PremiseModel } from '../models/premise'
import { parseStringArrayJson } from '../utils/json'

export async function syncBitPremiseRelation(input: {
    database: Database
    bitId: string
    previousPremiseId: string | null
    nextPremiseId: string | null
}) {
    const { database, bitId, previousPremiseId, nextPremiseId } = input

    if (previousPremiseId === nextPremiseId) return

    await database.write(async () => {
        if (previousPremiseId) {
            try {
                const previous = await database.get<PremiseModel>(PREMISE_TABLE).find(previousPremiseId)
                const previousIds = parseStringArrayJson(previous.bitIdsJson).filter((entry) => entry !== bitId)

                await previous.update((model) => {
                    model.bitIdsJson = JSON.stringify(previousIds)
                    model.updatedAt = new Date()
                })
            } catch (error) {
                dbLogger.debug('syncBitPremiseRelation failed to unlink premise relation', {
                    bitId,
                    previousPremiseId,
                    error,
                })
            }
        }

        if (nextPremiseId) {
            try {
                const next = await database.get<PremiseModel>(PREMISE_TABLE).find(nextPremiseId)
                const nextIds = parseStringArrayJson(next.bitIdsJson)

                if (!nextIds.includes(bitId)) {
                    nextIds.push(bitId)
                }

                await next.update((model) => {
                    model.bitIdsJson = JSON.stringify(nextIds)
                    model.updatedAt = new Date()
                })
            } catch (error) {
                dbLogger.debug('syncBitPremiseRelation failed to link premise relation', {
                    bitId,
                    nextPremiseId,
                    error,
                })
            }
        }
    })
}
