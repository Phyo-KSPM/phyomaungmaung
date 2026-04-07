import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
config({ path: resolve(root, '.env.local') })
config({ path: resolve(root, '.env') })

/**
 * Local dev without Mongo: fixed user kophyo / Letmein+123 + JWT still works for /api/admin.
 * Production (Vercel) always uses Mongo.
 */
export function isDevLoginWithoutDb(): boolean {
  if (process.env.NODE_ENV === 'production') return false
  if (process.env.DEV_LOGIN_NO_DB === '1') return true
  const uri = (
    process.env.MONGODB_URI ||
    process.env.users_MONGODB_URI ||
    process.env.USERS_MONGODB_URI ||
    ''
  ).trim()
  return uri.length === 0
}
