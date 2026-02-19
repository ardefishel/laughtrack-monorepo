import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { db } from '../../db'
import { audioRecordings } from '../../db/schema'
import { R2_BUCKET_NAME, getAudioObjectKey, r2Client } from '../../lib/r2'
import { requireAuth } from '../../middlewares/auth'

const audioRoutes = new Hono()

audioRoutes.post('/upload-url', requireAuth, async (c) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Unauthorized' }, 401)

    const { recordingId } = await c.req.json<{ recordingId: string }>()
    if (!recordingId) return c.json({ error: 'recordingId is required' }, 400)

    // Security: Verify recording exists and belongs to the user before generating upload URL
    const [recording] = await db
        .select()
        .from(audioRecordings)
        .where(and(eq(audioRecordings.id, recordingId), eq(audioRecordings.userId, user.id)))

    if (!recording) return c.json({ error: 'Recording not found' }, 404)

    const objectKey = getAudioObjectKey(user.id, recordingId)
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
        ContentType: 'audio/mp4',
    })

    const url = await getSignedUrl(r2Client, command, { expiresIn: 600 })

    return c.json({ url, key: objectKey, expiresIn: 600 })
})

audioRoutes.post('/confirm-upload', requireAuth, async (c) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Unauthorized' }, 401)

    const { recordingId, key } = await c.req.json<{ recordingId: string; key: string }>()
    if (!recordingId || !key) return c.json({ error: 'recordingId and key are required' }, 400)

    const expectedKey = getAudioObjectKey(user.id, recordingId)
    if (key !== expectedKey) return c.json({ error: 'Invalid key' }, 400)

    await db
        .update(audioRecordings)
        .set({ remoteUrl: key, lastModified: new Date() })
        .where(and(eq(audioRecordings.id, recordingId), eq(audioRecordings.userId, user.id)))

    return c.json({ ok: true })
})

audioRoutes.post('/download-url', requireAuth, async (c) => {
    const user = c.get('user')
    if (!user) return c.json({ error: 'Unauthorized' }, 401)

    const { recordingId } = await c.req.json<{ recordingId: string }>()
    if (!recordingId) return c.json({ error: 'recordingId is required' }, 400)

    const [recording] = await db
        .select()
        .from(audioRecordings)
        .where(and(eq(audioRecordings.id, recordingId), eq(audioRecordings.userId, user.id)))

    if (!recording || !recording.remoteUrl) return c.json({ error: 'Recording not found' }, 404)

    // Security: Reconstruct the key from user.id and recordingId instead of trusting recording.remoteUrl
    // This prevents IDOR attacks where a malicious user could manipulate remoteUrl to access other users' files
    const objectKey = getAudioObjectKey(user.id, recordingId)
    const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: objectKey,
    })

    const url = await getSignedUrl(r2Client, command, { expiresIn: 600 })

    return c.json({ url, expiresIn: 600 })
})

export { audioRoutes }
