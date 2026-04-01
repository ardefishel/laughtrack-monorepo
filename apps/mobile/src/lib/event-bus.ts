type EventMap = {
    'bit:deleted': { bitId: string }
    'bit:updated': { bitId: string }
    'premise:deleted': { premiseId: string }
    'premise:updated': { premiseId: string }
    'setlist:deleted': { setlistId: string }
    'setlist:updated': { setlistId: string }
    'note:deleted': { noteId: string }
}

type EventKey = keyof EventMap
type EventHandler<K extends EventKey> = (payload: EventMap[K]) => void

const listeners = new Map<EventKey, Set<EventHandler<EventKey>>>()

export function emit<K extends EventKey>(event: K, payload: EventMap[K]) {
    const handlers = listeners.get(event)
    if (!handlers) return
    for (const handler of handlers) {
        handler(payload)
    }
}

export function on<K extends EventKey>(event: K, handler: EventHandler<K>): () => void {
    if (!listeners.has(event)) {
        listeners.set(event, new Set())
    }
    const handlers = listeners.get(event)!
    handlers.add(handler as EventHandler<EventKey>)

    return () => {
        handlers.delete(handler as EventHandler<EventKey>)
    }
}
