/** Same UTC day string as server (access codes rotate daily). */
export function getUtcDateString(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function storageKeyForBlogUnlock(slug: string) {
  return `blog_unlock_${slug}`
}

export function isBlogUnlockedForToday(slug: string): boolean {
  try {
    const raw = sessionStorage.getItem(storageKeyForBlogUnlock(slug))
    if (!raw) return false
    const parsed = JSON.parse(raw) as { day?: string }
    return parsed.day === getUtcDateString()
  } catch {
    return false
  }
}

export function setBlogUnlockedForToday(slug: string, day: string) {
  sessionStorage.setItem(storageKeyForBlogUnlock(slug), JSON.stringify({ day }))
}
