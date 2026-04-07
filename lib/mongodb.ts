import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MongoClient, type MongoClientOptions } from 'mongodb'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
config({ path: resolve(projectRoot, '.env.local') })
config({ path: resolve(projectRoot, '.env') })

const options: MongoClientOptions = {
  appName: 'devrel.vercel.integration',
  maxIdleTimeMS: 5000,
}

function resolveUri(): string | undefined {
  return process.env.MONGODB_URI || process.env.users_MONGODB_URI || process.env.USERS_MONGODB_URI
}

let client: MongoClient | undefined

function createMongoClient(): MongoClient {
  const uri = resolveUri()
  if (!uri) {
    throw new Error(
      'Missing MongoDB URI: set MONGODB_URI or users_MONGODB_URI (or USERS_MONGODB_URI) in .env.local',
    )
  }
  const c = new MongoClient(uri, options)
  if (process.env.VERCEL === '1') {
    void import('@vercel/functions').then(({ attachDatabasePool }) => {
      attachDatabasePool(c)
    })
  }
  return c
}

function getClient(): MongoClient {
  if (!client) client = createMongoClient()
  return client
}

/** Lazy client so importing this module never throws (Vite config / dev server stays up without .env). */
const clientProxy = new Proxy({} as MongoClient, {
  get(_, prop) {
    const c = getClient()
    const value = Reflect.get(c, prop, c) as unknown
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(c)
    }
    return value
  },
})

export default clientProxy
