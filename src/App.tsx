import { type FormEvent, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { blogPosts, postHasFullContent } from './data/blogPosts'
import { apiFetch } from './lib/api'
import { isBlogUnlockedForToday, setBlogUnlockedForToday } from './lib/blogAccess'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog', to: '/blog' },
]

const skillSections = [
  {
    title: 'Frontend Development',
    items: [
      'ReactJS (React 18) + TypeScript',
      'Tailwind CSS',
      'HTML5 / CSS3 / Bootstrap',
    ],
  },
  {
    title: 'Backend Development',
    items: ['Node.js', 'Express.js', 'MongoDB'],
  },
  {
    title: 'Mobile Development',
    items: ['Flutter'],
  },
  {
    title: 'DevOps / Cloud / On-Prem / System Administration',
    items: [
      'Linux (Ubuntu / Oracle Linux)',
      'AWS EC2, Cloudflare, Apache, Nginx, OpenResty, Caddy',
      'Tomcat, Gunicorn, PM2',
      'Docker, VMware ESXi, VMware vCenter',
      'PostgreSQL Replication, HAProxy, Redis, Zimbra',
      'Zabbix, CI/CD (GitHub Actions, GitLab CI/CD), Ansible',
    ],
  },
  {
    title: 'Automation / Testing / Scripting / Tools',
    items: [
      'Python automation scripts',
      'n8n workflow automation',
      'Selenium web testing',
      'Ticketing and SLA monitoring systems',
    ],
  },
]

const projectOverviewSections = [
  {
    title: 'Ticketing System / SLA Tracking App',
    tech: 'Next.js, PostgreSQL 17, Redis, Node.js',
    features: [
      'Real-time event ingestion: Zabbix Media Type webhook integration sends JSON alerts directly to Node.js backend for automatic ticket creation.',
      'Alert deduplication and severity mapping: repeated alerts update existing tickets and trigger priority mapping (Critical/High/Average).',
      'High-performance backend: PostgreSQL 17 optimization with JSONB/partitioning strategy, Redis cache + Pub/Sub for live updates, and indexed queries on ticket/user/status.',
      'SLA monitoring and escalation logic: dynamic SLA timers by service tier, breach warnings before threshold, and business-hours-aware SLA calculation.',
      'Frontend and analytics (Next.js): live admin dashboard, engineer action workspace, and SLA performance reports across weekly/monthly windows.',
      'Security and RBAC: multi-role access (Admin, Supervisor, Engineer, Customer) and full audit trail for ticket-level change history.',
    ],
  },
  {
    title: 'ISP Management',
    tech: 'Node.js + TypeScript, React, Mikrotik API',
    features: [
      'Network Infrastructure & Engineering: Core/Edge routing, backbone connectivity, last-mile delivery (FTTH/Wireless/ADSL), and IPAM with IPv4/IPv6 + NAT.',
      'Service Operations & Monitoring: 24/7 NOC visibility, traffic engineering with QoS priorities, and bandwidth capacity planning.',
      'Automation & Software Systems: OSS/BSS workflows, Radius/AAA services, and software-driven operations management.',
      'Customer Lifecycle & Billing: CRM workflows, automated invoicing/payment integrations, and SLA management operations.',
      'Security & Governance: DDoS protection, firewall policies, malware filtering, traffic log management, and regulator compliance.',
      'Support & Field Operations: Helpdesk ticketing process, incident triage, and field engineering for physical network restoration.',
    ],
  },
  {
    title: 'Frontend / Portfolio Experiments',
    tech: 'React, Tailwind CSS, TypeScript',
    features: [
      'Advanced component architecture: reusable UI components (Button/Input/Modal/Card), type-safe props/interfaces, and custom hooks for shared logic.',
      'Modern styling and layouts: dark/light mode strategy, glassmorphism and gradient hero patterns, and advanced responsive grid/flex compositions.',
      'Navigation and UX experiments: sticky interactive navbar patterns, smooth section navigation with active-state detection, and mobile-first drawer menu behavior.',
      'Content showcase system: project filtering/sorting by category, dynamic routing for project detail pages, and optimized media loading strategy.',
      'Interactivity and micro-interactions: Framer Motion style section/button transitions and Lottie-ready animation integration points.',
    ],
  },
  {
    title: 'Zimbra Mail Server Deployment',
    tech: 'Linux (Ubuntu / Oracle Linux), Zimbra, AWS Lightsail',
    features: [
      'Prerequisites and planning: hardware sizing (CPU, RAM, storage), supported OS selection, DNS records (A/MX/PTR), and required firewall ports.',
      'Base setup and optimization: FQDN hostname and hosts file, remove conflicting mail agents, install dependencies, and system resource tuning.',
      'Zimbra installation: package extraction, module selection (LDAP/MTA/Store/Proxy/Memcached), initial admin/global configuration, and service initialization.',
      'Security and authentication: SSL/TLS deployment, SPF/DKIM/DMARC setup, anti-spam and anti-virus tuning (SpamAssassin/ClamAV), and Fail2Ban/firewall hardening.',
      'Post-deployment administration: domain/user provisioning, migration planning, backup/disaster recovery policy, and performance/mail-queue monitoring.',
      'Advanced configuration: Zimbra Proxy + Memcached optimization, multi-server deployment strategy, and custom webmail branding.',
    ],
  },
  {
    title: 'Infrastructure & Virtualization',
    tech: 'VMware ESXi, vCenter, PostgreSQL HA, HAProxy, Keepalived, Prometheus/Grafana, ELK',
    features: [
      'VMware infrastructure optimization: vSphere HA/DRS, VLAN tagging with vSwitch segmentation, and shared storage (iSCSI/NFS) for vMotion and high availability.',
      'PostgreSQL high availability: streaming replication (sync/async), Patroni/Repmgr for cluster management and auto-failover, and PgBouncer for connection pooling.',
      'Load balancing and traffic management: HAProxy with Keepalived (VIP), SSL termination at load balancer, and backend health checks.',
      'Backup and disaster recovery: VM-level backups, PostgreSQL WAL archiving for PITR, and offsite backup strategy.',
      'Monitoring and logging: Prometheus/Grafana dashboards, ELK centralized logging, and alert integrations (Telegram/Email).',
      'Security hardening: firewall isolation for critical nodes, private subnet strategy, and SSH hardening with key-based authentication.',
    ],
  },
  {
    title: 'Automation & Workflow Projects',
    tech: 'Python, n8n, Selenium, Ansible, GitHub/GitLab CI/CD',
    features: [
      'Advanced orchestration and integration: API-first workflows across Telegram, Discord, Google Sheets, and internal CRM/ERP systems.',
      'Workflow resiliency: error handling, retries, timeout recovery, and admin alerting for failed jobs.',
      'Custom logic execution: Python-powered processing for complex transformation and decision workflows in n8n.',
      'Event-driven automation: webhook triggers for real-time actions (for example, new ticket to automated workflow).',
      'Infrastructure as code and configuration: automated server provisioning, hardening, package bootstrap, and drift management with Ansible playbooks.',
      'Zero-downtime delivery workflow: rolling updates and controlled deployment lifecycle using CI/CD with script and Ansible integration.',
      'Web automation and testing: headless Selenium execution for health checks, regression flows, and automated report generation.',
      'Operational observability: centralized logging for automation scripts and execution dashboards for success/failure tracking.',
      'Secure automation operations: secret handling via vault/env strategy instead of hardcoded credentials.',
    ],
  },
  {
    title: 'Cloud & DevOps Experiments',
    tech: 'AWS EC2, Docker, Cloudflare',
    features: [
      'Advanced containerization: multi-container orchestration with Docker Compose/Swarm and image optimization through multi-stage builds.',
      'Persistent data architecture: volume-based storage strategy for databases and media to prevent data loss on container lifecycle changes.',
      'Container health lifecycle: health checks, automated restarts, and runtime reliability controls.',
      'Cloud infrastructure management on AWS EC2: scaling strategy, ALB integration, security groups, NACL policy, and Route 53 plus Elastic IP setup.',
      'Cost optimization operations: workload planning with Spot/Reserved instance strategy and right-sized resource allocation.',
      'Cloudflare security and performance: full proxy mode, WAF policies, under-attack controls, DDoS mitigation, and edge caching/page-rule tuning.',
      'Reverse proxy and SSL architecture: Nginx/OpenResty/Traefik routing with TLS termination (Origin Certificates or Let&apos;s Encrypt).',
      'Proxy-level load balancing and traffic distribution across backend services.',
      'Observability and DevOps culture: centralized log streaming (CloudWatch/ELK) and CI/CD pipeline integration for automated container deployments.',
    ],
  },
]

function CopyableCodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-300">Command</p>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-white/12 px-3 py-1 text-xs font-medium text-white transition hover:border-white/20 hover:bg-white/8"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('admin_token')) {
      navigate('/admin/access-codes', { replace: true })
    }
  }, [navigate])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setPending(true)
    setError('')
    try {
      const data = await apiFetch<{ token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      localStorage.setItem('admin_token', data.token)
      navigate('/admin/access-codes', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="page-content mx-auto max-w-md px-2 py-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="reveal-on-scroll reveal-delay-1 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
      >
        <span aria-hidden>←</span>
        Back
      </button>

      <div className="reveal-on-scroll reveal-delay-2 mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100/80">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Admin</p>
        <h1 className="mt-3 text-center text-2xl font-semibold tracking-tight text-slate-900">Sign in</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          After login you will see the access code list for blog posts.
        </p>

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="admin-username" className="block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="admin-username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none ring-slate-300 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 outline-none ring-slate-300 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2"
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="smooth-cta w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {pending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </section>
  )
}

type AdminRow = {
  no: number
  title: string
  accessCode: string
  publishedDate: string
  author: string
}

function AdminAccessCodesPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState<AdminRow[]>([])
  const [day, setDay] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const data = await apiFetch<{ generatedForUtcDay: string; rows: AdminRow[] }>('/api/admin/access-codes', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (cancelled) return
        setDay(data.generatedForUtcDay)
        setRows(data.rows)
      } catch {
        localStorage.removeItem('admin_token')
        navigate('/login', { replace: true })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  function logout() {
    localStorage.removeItem('admin_token')
    navigate('/login')
  }

  return (
    <section className="page-content mx-auto max-w-6xl px-2 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Access codes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Codes rotate daily (UTC). Today: <span className="font-mono font-medium">{day || '—'}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-300 hover:text-slate-900"
        >
          Log out
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-slate-600">Loading…</p>
      ) : (
        <div className="reveal-on-scroll reveal-delay-1 mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">No</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Access Code</th>
                <th className="px-4 py-3">Published Date</th>
                <th className="px-4 py-3">Author</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.no} className="text-slate-700">
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.no}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                  <td className="px-4 py-3 font-mono text-sm tracking-wide">{row.accessCode}</td>
                  <td className="px-4 py-3">{row.publishedDate}</td>
                  <td className="px-4 py-3">{row.author}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function BlogDetailPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const post = blogPosts.find((item) => item.slug === slug)

  const [codeInput, setCodeInput] = useState('')
  const [verifyError, setVerifyError] = useState('')
  const [verifyPending, setVerifyPending] = useState(false)
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    if (!post?.slug) return
    setUnlocked(isBlogUnlockedForToday(post.slug))
  }, [post?.slug])

  useEffect(() => {
    setCodeInput('')
    setVerifyError('')
    setVerifyPending(false)
  }, [post?.slug])

  async function onVerifyAccess(e: FormEvent) {
    e.preventDefault()
    if (!post) return
    setVerifyPending(true)
    setVerifyError('')
    try {
      const data = await apiFetch<{ ok: boolean; day: string }>('/api/blog/verify', {
        method: 'POST',
        body: JSON.stringify({ slug: post.slug, code: codeInput }),
      })
      if (data.ok) {
        setBlogUnlockedForToday(post.slug, data.day)
        setUnlocked(true)
      }
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Invalid access code')
    } finally {
      setVerifyPending(false)
    }
  }

  if (!post) {
    return (
      <section className="page-content mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate('/blog')}
          className="reveal-on-scroll reveal-delay-1 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
        >
          <span aria-hidden>←</span>
          Back to Blog
        </button>
        <div className="reveal-on-scroll reveal-delay-2 mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-8">
          <h3 className="text-2xl font-semibold text-slate-900">Post not found</h3>
          <p className="mt-3 text-slate-600">This blog detail page is not available yet.</p>
        </div>
      </section>
    )
  }

  const hasFull = postHasFullContent(post)
  const authorLine = post.author ?? 'Phyo Maung Maung'
  const needsCodeWall = hasFull && !unlocked

  const introParagraph =
    needsCodeWall || !hasFull ? post.excerpt : (post.detailIntro ?? post.excerpt)

  return (
    <section className="page-content mx-auto max-w-4xl">
      <button
        type="button"
        onClick={() => navigate('/blog')}
        className="reveal-on-scroll reveal-delay-1 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
      >
        <span aria-hidden>←</span>
        Back to Blog
      </button>

      <article className="mt-6">
        <img
          src={post.image}
          alt={post.title}
          className="reveal-on-scroll reveal-delay-2 h-52 w-full rounded-3xl object-cover ring-1 ring-slate-200/80 sm:h-72"
        />
        <p className="reveal-on-scroll reveal-delay-2 mt-6 text-sm font-medium text-slate-500">
          {post.date} · by {authorLine} · {post.category} · {post.readTime}
        </p>
        <h1 className="reveal-on-scroll reveal-delay-3 mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {post.title}
        </h1>
        <p className="reveal-on-scroll reveal-delay-4 mt-5 text-base leading-relaxed text-slate-600">{introParagraph}</p>

        {!hasFull ? (
          <section className="reveal-on-scroll reveal-delay-3 mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Full guide coming soon</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
              Step-by-step commands and extended notes for this topic are not published yet.
            </p>
          </section>
        ) : needsCodeWall ? (
          <section className="reveal-on-scroll reveal-delay-3 mt-8 overflow-hidden rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-50 via-white to-slate-50 p-8 shadow-sm">
            <div className="flex flex-col sm:items-stretch">
              <span className="inline-flex w-fit items-center rounded-full border border-sky-300/80 bg-sky-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-900">
                Access code required
              </span>
              <h2 className="mt-4 text-xl font-semibold text-slate-900">Enter today&apos;s access code</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
                Full article content is available after you enter the correct code for this post. Codes refresh once per
                day (UTC).
              </p>
              <form className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row sm:items-end" onSubmit={onVerifyAccess}>
                <div className="min-w-0 flex-1">
                  <label htmlFor="blog-access-code" className="block text-sm font-medium text-slate-700">
                    Access code
                  </label>
                  <input
                    id="blog-access-code"
                    name="code"
                    type="text"
                    autoComplete="off"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 font-mono text-sm tracking-wider text-slate-900 outline-none ring-slate-300 transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2"
                    placeholder="e.g. A1B2C3D4"
                  />
                </div>
                <button
                  type="submit"
                  disabled={verifyPending}
                  className="smooth-cta rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60 sm:shrink-0"
                >
                  {verifyPending ? 'Checking…' : 'Unlock'}
                </button>
              </form>
              {verifyError ? <p className="mt-3 text-sm text-red-600">{verifyError}</p> : null}
            </div>
          </section>
        ) : (
          <>
            {post.detailSummary && (
              <div className="reveal-on-scroll reveal-delay-4 mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Why use this method</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
                  {post.detailSummary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {post.steps && (
              <div className="mt-8 space-y-6">
                {post.steps.map((step, index) => (
                  <section
                    key={step.title}
                    className={`reveal-on-scroll reveal-delay-${(index % 4) + 1} rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100/70`}
                  >
                    <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
                    {step.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.description}</p>}
                    {step.code && <CopyableCodeBlock code={step.code} />}
                  </section>
                ))}
              </div>
            )}

            {post.commands && (
              <section className="reveal-on-scroll reveal-delay-3 mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100/70">
                <h2 className="text-lg font-semibold text-slate-900">Useful commands</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-[1.3fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <span>Command</span>
                    <span>Description</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {post.commands.map((item) => (
                      <div key={item.command} className="grid grid-cols-[1.3fr_1fr] gap-3 px-4 py-3 text-sm text-slate-600">
                        <code className="font-medium text-slate-900">{item.command}</code>
                        <span>{item.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {post.notes && (
              <section className="reveal-on-scroll reveal-delay-4 mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Extra Notes</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
                  {post.notes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </article>
    </section>
  )
}

function Layout() {
  const location = useLocation()
  const blogNavIndex = navItems.findIndex((item) => item.to === '/blog')
  const matchedNavIndex = navItems.findIndex((item) =>
    item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to),
  )
  const activeNavIndex =
    (location.pathname.startsWith('/login') || location.pathname.startsWith('/admin')) && blogNavIndex >= 0
      ? blogNavIndex
      : Math.max(matchedNavIndex, 0)
  const previousNavIndex = useRef(activeNavIndex)
  const [transitionClass, setTransitionClass] = useState('page-transition-right')

  useEffect(() => {
    if (activeNavIndex > previousNavIndex.current) {
      setTransitionClass('page-transition-right')
    } else if (activeNavIndex < previousNavIndex.current) {
      setTransitionClass('page-transition-left')
    }
    previousNavIndex.current = activeNavIndex
  }, [activeNavIndex, location.pathname])

  const pageGridStyle =
    activeNavIndex === 0
      ? 'grid-home'
      : activeNavIndex === 1
        ? 'grid-about'
        : activeNavIndex === 2
          ? 'grid-projects'
          : 'grid-blog'

  useEffect(() => {
    document.body.setAttribute('data-grid-style', pageGridStyle)
  }, [pageGridStyle])

  useEffect(() => {
    const revealRoot = document.querySelector('main')
    if (!revealRoot) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const observedItems = new Set<HTMLElement>()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          } else {
            entry.target.classList.remove('is-visible')
          }
        })
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -6% 0px',
      },
    )

    const syncRevealItems = () => {
      const revealItems = Array.from(
        revealRoot.querySelectorAll<HTMLElement>('.reveal-on-scroll'),
      )

      revealItems.forEach((item) => {
        if (prefersReducedMotion.matches) {
          item.classList.add('is-visible')
          return
        }

        if (observedItems.has(item)) return

        item.classList.remove('is-visible')
        observer.observe(item)
        observedItems.add(item)
      })

      observedItems.forEach((item) => {
        if (item.isConnected) return
        observer.unobserve(item)
        observedItems.delete(item)
      })
    }

    syncRevealItems()

    const mutationObserver = new MutationObserver(() => {
      syncRevealItems()
    })

    mutationObserver.observe(revealRoot, {
      childList: true,
      subtree: true,
    })

    return () => {
      mutationObserver.disconnect()
      observer.disconnect()
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-transparent text-slate-800">
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:px-8 lg:px-10">
        <header className="sticky top-3 z-30 mb-12">
          <nav className="flex justify-center">
            <div className="ios-glass-nav relative inline-grid grid-cols-4 items-center rounded-full p-1.5">
              <span
                aria-hidden
                className="ios-glass-indicator absolute bottom-1.5 top-1.5 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: 'calc((100% - 0.75rem) / 4)',
                  left: `calc(0.375rem + ${activeNavIndex} * ((100% - 0.75rem) / 4))`,
                }}
              />
              {navItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={({ isActive }) => {
                    const blogActive =
                      item.to === '/blog' &&
                      (location.pathname.startsWith('/blog') ||
                        location.pathname.startsWith('/login') ||
                        location.pathname.startsWith('/admin'))
                    const active =
                      item.to === '/' ? location.pathname === '/' : item.to === '/blog' ? blogActive : isActive
                    return `relative z-10 flex items-center justify-center rounded-full px-6 py-2.5 text-center text-base font-semibold leading-none transition ${
                      active ? 'text-slate-900' : 'text-slate-700/90 hover:text-slate-900'
                    }`
                  }}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </header>

        <main className="min-h-[56vh]">
          <div key={location.pathname} className={transitionClass}>
            <Outlet />
          </div>
        </main>

        <footer className="mt-20 border-t border-slate-200 pt-10">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <h4 className="text-lg font-semibold text-slate-900">Phyo Maung Maung</h4>
              <p className="mt-2 text-sm text-slate-600">
                Full-Stack Developer & DevOps/Automation Specialist helping businesses and engineering teams
                build reliable web applications, scalable infrastructure, and automated delivery workflows.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <NavLink to={item.to} className="footer-quick-link inline-flex hover:text-slate-900">
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Contact</h4>
              <p className="mt-3 text-sm text-slate-600">Have questions or want to work together?</p>
              <p className="mt-3 text-sm text-slate-700">
                Email:{' '}
                <a
                  href="mailto:phyomaungmaung.it@gmail.com"
                  className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                >
                  phyomaungmaung.it@gmail.com
                </a>
              </p>
              <p className="mt-2 text-sm text-slate-700">
                Phone:{' '}
                <a
                  href="tel:09880939181"
                  className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
                >
                  09880939181
                </a>
              </p>
              <a
                href="mailto:phyomaungmaung.it@gmail.com"
                className="mt-4 inline-block text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900"
              >
                Get in touch
              </a>
            </div>
          </div>
          <p className="mt-10 text-sm text-slate-500">© 2026 Phyo Maung Maung. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <section className="page-content mx-auto max-w-5xl px-2 py-2 text-center">
      <img
        src="/kophyo_png.png"
        alt="Phyo Maung Maung profile"
        className="reveal-on-scroll reveal-delay-1 mx-auto mb-6 h-28 w-28 rounded-full object-cover ring-4 ring-slate-100 sm:h-32 sm:w-32"
      />
      <p className="reveal-on-scroll reveal-delay-2 text-base font-medium text-slate-600">DevOps Engineer</p>
      <h1 className="reveal-on-scroll reveal-delay-3 mt-3 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
        Phyo Maung Maung
      </h1>
      <h2 className="reveal-on-scroll reveal-delay-4 mt-4 text-2xl font-semibold text-slate-700 sm:text-3xl">
        Full-Stack Developer & DevOps/Automation Specialist
      </h2>
      <p className="reveal-on-scroll reveal-delay-5 mx-auto mt-6 max-w-3xl text-base leading-relaxed text-slate-600">
        I build and operate end-to-end digital systems-from modern web applications to production-grade
        infrastructure. My work covers CI/CD automation, Kubernetes and Docker deployments, cloud/on-prem
        operations, monitoring, and high-availability architecture to help teams deliver faster with reliability.
      </p>

      <div className="reveal-on-scroll reveal-delay-6 mt-8 flex flex-wrap items-center justify-center gap-3">
        <NavLink to="/projects" className="smooth-cta rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700">
          View Projects
        </NavLink>
      </div>

      <div className="reveal-on-scroll reveal-delay-6 mt-8 grid gap-4 text-left md:grid-cols-2">
        <NavLink to="/projects" className="smooth-line-item border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Projects</p>
          <h4 className="mt-2 text-lg font-semibold text-slate-900">8 completed and experimental projects</h4>
          <p className="mt-2 text-sm text-slate-600">Ticketing system, ISP management, virtualization, and cloud DevOps.</p>
        </NavLink>
        <NavLink to="/about" className="smooth-line-item border-b border-slate-200 pb-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Skills</p>
          <h4 className="mt-2 text-lg font-semibold text-slate-900">Full stack + infrastructure depth</h4>
          <p className="mt-2 text-sm text-slate-600">React, Node.js, Docker, Kubernetes, VMware, Zabbix, and automation tools.</p>
        </NavLink>
      </div>
    </section>
  )
}

function AboutPage() {
  const [openSkillIndex, setOpenSkillIndex] = useState<number | null>(0)

  return (
    <section className="page-content mx-auto max-w-5xl space-y-8">
      <article className="reveal-on-scroll reveal-delay-1">
        <h3 className="text-2xl font-semibold text-slate-900">About Me</h3>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          I work on Docker, Kubernetes, Terraform, and AWS to build resilient infrastructure and smooth developer
          delivery workflows. My focus is simple: improve reliability, reduce operational friction, and make
          deployments predictable.
        </p>
      </article>

      <article className="reveal-on-scroll reveal-delay-2">
        <h3 className="text-2xl font-semibold text-slate-900">Skills</h3>
        <div className="mt-5 space-y-4">
          {skillSections.map((section, index) => {
            const isOpen = openSkillIndex === index

            return (
              <article
                key={section.title}
                className={`reveal-on-scroll reveal-delay-${(index % 4) + 1} border-b border-slate-200 pb-4`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenSkillIndex(isOpen ? null : index)}
                  className="skill-toggle-button flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="min-w-0">
                    <span
                      className={`block text-base font-semibold transition-colors ${
                        isOpen ? 'text-sky-700' : 'text-slate-900'
                      }`}
                    >
                      {section.title}
                    </span>
                    <span className={`mt-0.5 block text-xs transition-colors ${isOpen ? 'text-sky-600' : 'text-slate-500'}`}>
                      {isOpen ? 'Tap to collapse' : 'Tap to expand'}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`skill-toggle-icon ${isOpen ? 'skill-toggle-icon-open' : ''}`}
                  >
                    <span className="skill-toggle-icon-line" />
                    <span className="skill-toggle-icon-line skill-toggle-icon-line-vertical" />
                  </span>
                </button>
                <div className={`skill-accordion-content ${isOpen ? 'skill-accordion-open' : ''}`}>
                  <div className="skill-accordion-inner">
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-600">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </article>
    </section>
  )
}

function ProjectsPage() {
  const [openProjectIndex, setOpenProjectIndex] = useState<number | null>(0)

  return (
    <section className="page-content mx-auto max-w-5xl">
      <h3 className="reveal-on-scroll reveal-delay-1 text-2xl font-semibold text-slate-900">Projects Overview</h3>
      <p className="reveal-on-scroll reveal-delay-2 mt-2 text-sm text-slate-600">
        Tap a project to expand the details.
      </p>

      <div className="mt-6 space-y-4">
        {projectOverviewSections.map((project, index) => {
          const isOpen = openProjectIndex === index

          return (
            <article
              key={project.title}
              className={`reveal-on-scroll reveal-delay-${(index % 4) + 1} border-b border-slate-200 pb-4`}
            >
              <button
                key={project.title}
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenProjectIndex(isOpen ? null : index)}
                className="skill-toggle-button flex w-full items-center justify-between gap-4 py-1 text-left"
              >
                <span className="min-w-0">
                  <span
                    className={`block text-xs font-semibold uppercase tracking-wide transition-colors ${
                      isOpen ? 'text-sky-600' : 'text-slate-500'
                    }`}
                  >
                    Project
                  </span>
                  <span
                    className={`mt-2 block text-base font-semibold leading-snug transition-colors ${
                      isOpen ? 'text-sky-700' : 'text-slate-900'
                    }`}
                  >
                    {project.title}
                  </span>
                  <span className={`mt-1 block text-sm transition-colors ${isOpen ? 'text-sky-600' : 'text-slate-500'}`}>
                    {isOpen ? 'Tap to collapse' : 'Tap to expand'}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`skill-toggle-icon ${isOpen ? 'skill-toggle-icon-open' : ''}`}
                >
                  <span className="skill-toggle-icon-line" />
                  <span className="skill-toggle-icon-line skill-toggle-icon-line-vertical" />
                </span>
              </button>
              <div className={`skill-accordion-content ${isOpen ? 'skill-accordion-open' : ''}`}>
                <div className="skill-accordion-inner">
                  <div className="project-detail-transition mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold">Tech:</span> {project.tech}
                    </p>
                    <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                      {project.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const categories = ['All', ...Array.from(new Set(blogPosts.map((post) => post.category)))]
  const filteredPosts =
    selectedCategory === 'All'
      ? blogPosts
      : blogPosts.filter((post) => post.category === selectedCategory)

  return (
    <section className="page-content mx-auto max-w-6xl">
      <h3 className="reveal-on-scroll reveal-delay-1 text-4xl font-semibold tracking-tight text-slate-900">Blog</h3>
      <p className="reveal-on-scroll reveal-delay-2 mt-3 max-w-3xl text-slate-600">
        Insights, tips, and practical guides focused on DevOps, cloud infrastructure, and automation workflows.
      </p>

      <div className="reveal-on-scroll reveal-delay-3 mt-8">
        <h4 className="text-lg font-semibold text-slate-900">Categories</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                selectedCategory === category
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {filteredPosts.map((post) => (
          <Link
            key={post.title}
            to={`/blog/${post.slug}`}
            className="reveal-on-scroll reveal-delay-4 block border-b border-slate-200 pb-4 transition hover:translate-x-1"
          >
            <div className="relative mb-3">
              <img
                src={post.image}
                alt={post.title}
                className="h-40 w-full rounded-xl object-cover ring-1 ring-slate-200/70 sm:h-48"
              />
              {postHasFullContent(post) && (
                <span className="absolute right-3 top-3 rounded-full border border-sky-300/90 bg-sky-100/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-900 shadow-sm">
                  Access code
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {post.date} · by {post.author ?? 'Phyo Maung Maung'} · {post.category} · {post.readTime}
            </p>
            <h4 className="mt-1 text-xl font-semibold text-slate-900">{post.title}</h4>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-600">{post.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blog/:slug" element={<BlogDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="admin/access-codes" element={<AdminAccessCodesPage />} />
        <Route path="premium/login" element={<Navigate to="/login" replace />} />
      </Route>
    </Routes>
  )
}

export default App
