export type BlogStep = {
  title: string
  description?: string
  code?: string
}

export type BlogCommand = {
  command: string
  description: string
}

export type BlogPost = {
  slug: string
  title: string
  date: string
  category: string
  image: string
  excerpt: string
  readTime: string
  author?: string
  detailIntro?: string
  detailSummary?: string[]
  steps?: BlogStep[]
  commands?: BlogCommand[]
  notes?: string[]
}
