/**
 * Vercel serverless: all `/api/*` → Express (same as local dev).
 * Set MONGODB_URI, JWT_SECRET, ACCESS_CODE_SECRET in Vercel project settings.
 */
import serverless from 'serverless-http'
import { createApp, initApiDatabase } from '../server/api-server.ts'

await initApiDatabase()

export default serverless(createApp())
