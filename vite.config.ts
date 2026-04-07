import type { Application } from 'express'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

/** Load .env before first /api hit */
import './server/devMode.ts'

/**
 * Local: `npm run dev` only — `/api` inside Vite. No Mongo URI → login still works (devMode).
 * Production: Vercel `api/[...path].ts`.
 */
function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev',
    enforce: 'pre',
    configureServer(server) {
      let app: Application | null = null
      let ready: Promise<Application> | null = null

      function ensureApp(): Promise<Application> {
        if (app) return Promise.resolve(app)
        if (!ready) {
          ready = import('./server/api-server.ts').then(async (mod) => {
            await mod.initApiDatabase()
            app = mod.createApp()
            return app
          })
        }
        return ready
      }

      server.middlewares.use((req, res, next) => {
        if (!(req.url ?? '').startsWith('/api')) {
          next()
          return
        }
        void ensureApp()
          .then((a) => {
            a(req as never, res as never, next)
          })
          .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err)
            console.error('[api]', err)
            if (res.headersSent) return
            res.statusCode = 503
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'API unavailable', detail: msg }))
          })
      })
    },
  }
}

export default defineConfig({
  plugins: [tailwindcss(), apiDevPlugin()],
})
