const STORAGE_KEY = 'streamnotify_applications_v1'

export function loadApplications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // fall through
  }
  return []
}

export function saveApplications(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // localStorage may be unavailable; ignore
  }
}

export function submitApplication(app) {
  const list = loadApplications()
  const next = [
    {
      id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: app.name,
      platform: app.platform,
      link: app.link,
      discord: app.discord || '',
      message: app.message || '',
      status: app.status || 'pending',
      reviewedAt: null,
      createdAt: Date.now(),
    },
    ...list,
  ]
  saveApplications(next)
  return next
}

export function setApplicationStatus(id, status) {
  const list = loadApplications().map((a) =>
    a.id === id ? { ...a, status, reviewedAt: Date.now() } : a
  )
  saveApplications(list)
  return list
}

export function deleteApplication(id) {
  const list = loadApplications().filter((a) => a.id !== id)
  saveApplications(list)
  return list
}
