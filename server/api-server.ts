import bcrypt from 'bcryptjs'
import cors from 'cors'
import express, { type Request, type Response, type NextFunction } from 'express'
import { Binary } from 'mongodb'
import { SignJWT, jwtVerify } from 'jose'
import client from '../lib/mongodb.ts'
import { blogPosts } from '../src/data/blogPosts.ts'
import { isDevLoginWithoutDb } from './devMode.ts'
import { generateAccessCode, getUtcDateString } from './accessCode.ts'

/** HS256 key must be non-empty (jose throws "Zero-length key is not supported"). */
function getJwtSecretBytes(): Uint8Array {
  const raw = (process.env.JWT_SECRET ?? '').trim()
  const secret =
    raw.length > 0 ? raw : 'dev-jwt-secret-change-in-production-min-32-chars-ok'
  return new TextEncoder().encode(secret)
}

const JWT_SECRET = getJwtSecretBytes()

function passwordHashToString(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (value instanceof Binary) return value.toString('utf8')
  return null
}

async function ensureDefaultUser() {
  const db = client.db('portfolio')
  const users = db.collection('users')
  const hash = await bcrypt.hash('Letmein+123', 10)
  await users.replaceOne(
    { username: 'kophyo' },
    { username: 'kophyo', passwordHash: hash },
    { upsert: true },
  )
}

/** Connect + seed user (skipped in local dev when no Mongo URI — see isDevLoginWithoutDb). */
export async function initApiDatabase() {
  if (isDevLoginWithoutDb()) return
  await client.connect()
  await ensureDefaultUser()
}

async function authAdmin(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    await jwtVerify(token, JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export function createApp() {
  const app = express()
  app.use(cors({ origin: true, credentials: true }))
  app.use(express.json())

  app.post('/api/auth/login', async (req, res) => {
    try {
      const username = String(req.body?.username ?? '').trim()
      const password = String(req.body?.password ?? '')
      if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' })
        return
      }

      if (isDevLoginWithoutDb()) {
        if (username === 'kophyo' && password === 'Letmein+123') {
          const token = await new SignJWT({ sub: username, role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(JWT_SECRET)
          res.json({ token })
          return
        }
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }

      await client.connect()
      const db = client.db('portfolio')
      const user = await db.collection('users').findOne<{ passwordHash: unknown }>({ username })
      const hashStr = user ? passwordHashToString(user.passwordHash) : null
      if (!hashStr) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }
      let passwordOk = false
      try {
        passwordOk = await bcrypt.compare(password, hashStr)
      } catch {
        passwordOk = false
      }
      if (!passwordOk) {
        res.status(401).json({ error: 'Invalid credentials' })
        return
      }
      const token = await new SignJWT({ sub: username, role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET)
      res.json({ token })
    } catch (e) {
      console.error('POST /api/auth/login', e)
      const message = e instanceof Error ? e.message : String(e)
      res.status(500).json({
        error: 'Login failed',
        detail: message,
      })
    }
  })

  app.get('/api/admin/access-codes', authAdmin, (_req, res) => {
    try {
      const day = getUtcDateString()
      const rows = blogPosts.map((post, index) => ({
        no: index + 1,
        title: post.title,
        accessCode: generateAccessCode(post.slug, day),
        publishedDate: post.date,
        author: post.author ?? 'Phyo Maung Maung',
        slug: post.slug,
      }))
      res.json({ generatedForUtcDay: day, rows })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Failed to list access codes' })
    }
  })

  app.post('/api/blog/verify', (req, res) => {
    try {
      const slug = String(req.body?.slug ?? '').trim()
      const code = String(req.body?.code ?? '').trim().toUpperCase()
      if (!slug || !code) {
        res.status(400).json({ error: 'Slug and code required' })
        return
      }
      const day = getUtcDateString()
      const expected = generateAccessCode(slug, day)
      if (code !== expected) {
        res.status(401).json({ error: 'Invalid access code' })
        return
      }
      res.json({ ok: true, day })
    } catch (e) {
      console.error(e)
      res.status(500).json({ error: 'Verification failed' })
    }
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, devNoDb: isDevLoginWithoutDb() })
  })

  return app
}

export async function startServer(port = 8787) {
  await initApiDatabase()
  const app = createApp()
  app.listen(port, () => {
    console.log(`API server http://localhost:${port}`)
  })
}
