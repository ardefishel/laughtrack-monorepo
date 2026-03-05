import { uiLogger } from '@/lib/loggers'
import {
    appendParagraphAfterTrailingHeading,
    countLogicalBreaks,
    extractTextFromHtml,
    hasSingleParagraphBlock,
    hasTrailingHeadingBlock,
    normalizeEditorText,
} from '@/features/bit/editor/html'
import { useCallback, useRef, useState } from 'react'
import type {
    EnrichedTextInputInstance,
    OnChangeHtmlEvent,
    OnChangeStateEvent,
    OnChangeTextEvent,
    OnKeyPressEvent,
} from 'react-native-enriched'

type ActiveHeading = 'h1' | 'h2'

type PendingHeadingEnter = {
    heading: ActiveHeading
    beforeHtml: string
    beforeText: string
    htmlEventsAfterEnter: number
    keypressSeq: number
    armedAtMs: number
}

type UseBitEditorInput = {
    onContentChange: (nextHtml: string) => void
}

function extractTextFromChangeEvent(event: OnChangeTextEvent | OnChangeHtmlEvent): string {
    return event.value ?? ''
}

function extractHtmlFromChangeEvent(event: OnChangeHtmlEvent | OnChangeTextEvent): string {
    return event.value ?? ''
}

export function useBitEditor({ onContentChange }: UseBitEditorInput) {
    const editorRef = useRef<EnrichedTextInputInstance>(null)
    const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>(null)
    const activeHeadingRef = useRef<ActiveHeading | null>(null)
    const eventSequenceRef = useRef(0)
    const lastHtmlRef = useRef('')
    const lastTextRef = useRef('')
    const pendingHeadingEnterRef = useRef<PendingHeadingEnter | null>(null)

    const logEditorEvent = useCallback((event: string, payload: Record<string, unknown>) => {
        eventSequenceRef.current += 1
        uiLogger.debug('BitEditor event:', {
            seq: eventSequenceRef.current,
            event,
            ...payload,
        })
        return eventSequenceRef.current
    }, [])

    const syncSnapshot = useCallback((html: string) => {
        lastHtmlRef.current = html
        lastTextRef.current = extractTextFromHtml(html)
        pendingHeadingEnterRef.current = null
    }, [])

    const attemptHeadingEnterRecovery = useCallback(
        (nextHtml: string): string | null => {
            const pending = pendingHeadingEnterRef.current
            if (!pending) return null

            const nowMs = Date.now()
            if (nowMs - pending.armedAtMs > 400) {
                pendingHeadingEnterRef.current = null
                logEditorEvent('heading-enter-expired', {
                    keypressSeq: pending.keypressSeq,
                    ageMs: nowMs - pending.armedAtMs,
                })
                return null
            }

            pending.htmlEventsAfterEnter += 1
            const didLoseHeading =
                hasTrailingHeadingBlock(pending.beforeHtml, pending.heading) && !nextHtml.includes(`<${pending.heading}>`)
            const beforeText = normalizeEditorText(pending.beforeText)
            const nextText = normalizeEditorText(extractTextFromHtml(nextHtml))
            const sameText = beforeText === nextText
            const beforeBreaks = countLogicalBreaks(pending.beforeHtml)
            const nextBreaks = countLogicalBreaks(nextHtml)
            const missingBreak = nextBreaks <= beforeBreaks
            const isNextSingleParagraph = hasSingleParagraphBlock(nextHtml)

            logEditorEvent('heading-enter-validate', {
                heading: pending.heading,
                keypressSeq: pending.keypressSeq,
                htmlEventsAfterEnter: pending.htmlEventsAfterEnter,
                didLoseHeading,
                sameText,
                missingBreak,
                beforeBreaks,
                nextBreaks,
                isNextSingleParagraph,
                nextHtml,
            })

            const shouldRepair = didLoseHeading && sameText && missingBreak && isNextSingleParagraph && beforeText.length > 0
            if (!shouldRepair) {
                if (pending.htmlEventsAfterEnter >= 3) {
                    pendingHeadingEnterRef.current = null
                    logEditorEvent('heading-enter-resolved', {
                        keypressSeq: pending.keypressSeq,
                        reason: 'normal-transition',
                    })
                }
                return null
            }

            const repairedHtml = appendParagraphAfterTrailingHeading(pending.beforeHtml, pending.heading)
            if (!repairedHtml || repairedHtml === nextHtml) {
                pendingHeadingEnterRef.current = null
                logEditorEvent('heading-enter-repair-skipped', {
                    keypressSeq: pending.keypressSeq,
                    reason: 'repair-html-unavailable',
                })
                return null
            }

            editorRef.current?.setValue(repairedHtml)
            pendingHeadingEnterRef.current = null
            logEditorEvent('heading-enter-repaired', {
                keypressSeq: pending.keypressSeq,
                repairedHtml,
            })
            return repairedHtml
        },
        [logEditorEvent],
    )

    const onChangeText = useCallback(
        (event: { nativeEvent: OnChangeTextEvent }) => {
            const text = extractTextFromChangeEvent(event.nativeEvent)
            lastTextRef.current = text
            logEditorEvent('change-text', {
                activeHeading: activeHeadingRef.current,
                textLength: text.length,
                text,
            })
        },
        [logEditorEvent],
    )

    const onChangeHtml = useCallback(
        (event: { nativeEvent: OnChangeHtmlEvent }) => {
            const html = extractHtmlFromChangeEvent(event.nativeEvent)
            const repairedHtml = attemptHeadingEnterRecovery(html)
            const nextHtml = repairedHtml ?? html
            lastHtmlRef.current = nextHtml
            logEditorEvent('change-html', {
                activeHeading: activeHeadingRef.current,
                htmlLength: nextHtml.length,
                html: nextHtml,
                wasRepaired: repairedHtml !== null,
            })
            onContentChange(nextHtml)
            lastTextRef.current = extractTextFromHtml(nextHtml)
        },
        [attemptHeadingEnterRecovery, logEditorEvent, onContentChange],
    )

    const onChangeState = useCallback(
        (event: { nativeEvent: OnChangeStateEvent }) => {
            const state = event.nativeEvent
            logEditorEvent('change-state', {
                h1: state.h1,
                h2: state.h2,
                activeHeadingBefore: activeHeadingRef.current,
            })
            setStylesState(state)
            if (state.h1?.isActive) activeHeadingRef.current = 'h1'
            else if (state.h2?.isActive) activeHeadingRef.current = 'h2'
            else activeHeadingRef.current = null
            logEditorEvent('active-heading-updated', {
                activeHeadingAfter: activeHeadingRef.current,
            })
        },
        [logEditorEvent],
    )

    const onKeyPress = useCallback(
        (event: { nativeEvent: OnKeyPressEvent }) => {
            const key = event.nativeEvent.key
            const activeHeading = activeHeadingRef.current
            const sequence = logEditorEvent('key-press', {
                key,
                activeHeading,
                pendingRecovery: pendingHeadingEnterRef.current !== null,
            })

            if ((key === 'Enter' || key === '\n') && activeHeading) {
                pendingHeadingEnterRef.current = {
                    heading: activeHeading,
                    beforeHtml: lastHtmlRef.current,
                    beforeText: lastTextRef.current,
                    htmlEventsAfterEnter: 0,
                    keypressSeq: sequence,
                    armedAtMs: Date.now(),
                }

                logEditorEvent('heading-enter-pending', {
                    keypressSeq: sequence,
                    heading: activeHeading,
                    beforeHtml: lastHtmlRef.current,
                    beforeText: lastTextRef.current,
                })
            }
        },
        [logEditorEvent],
    )

    return {
        editorRef,
        stylesState,
        onChangeText,
        onChangeHtml,
        onChangeState,
        onKeyPress,
        syncSnapshot,
    }
}
