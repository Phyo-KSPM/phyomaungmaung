import crypto from 'node:crypto'

/** UTC calendar day YYYY-MM-DD (access codes rotate daily). */
export function getUtcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function generateAccessCode(slug: string, dateStr: string): string {
  const secret = process.env.ACCESS_CODE_SECRET || 'change-me-access-code-secret'
  return crypto.createHmac('sha256', secret).update(`${slug}:${dateStr}`).digest('hex').slice(0, 8).toUpperCase()
}
