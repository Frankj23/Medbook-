const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

function buildUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

function getAuthToken() {
  if (!isBrowser()) return null
  return localStorage.getItem('labflow_token')
}

async function request(path, options = {}) {
  const url = buildUrl(path)
  const token = getAuthToken()
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`API request failed ${response.status}: ${body}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

const cache = {
  patients: [],
  consultations: [],
  lab_orders: [],
  lab_results: [],
  prescriptions: [],
  triages: [],
}

const STORAGE_KEY = 'labflow_offline_cache_v1'
const PENDING_KEY = 'labflow_pending_ops_v1'
let pendingOperations = []

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

function isOnline() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

function loadStoredCache() {
  if (!isBrowser()) return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const stored = JSON.parse(raw)
    Object.keys(cache).forEach(table => {
      if (Array.isArray(stored[table])) {
        cache[table] = stored[table]
      }
    })
  } catch (error) {
    console.warn('Failed to load offline cache', error)
  }
}

function saveCache() {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.warn('Failed to save offline cache', error)
  }
}

function loadPendingOperations() {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(PENDING_KEY)
    if (!raw) return []
    return JSON.parse(raw) || []
  } catch (error) {
    console.warn('Failed to load pending operations', error)
    return []
  }
}

function savePendingOperations() {
  if (!isBrowser()) return
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(pendingOperations))
  } catch (error) {
    console.warn('Failed to save pending operations', error)
  }
}

function queueOperation(table, type, payload) {
  const op = {
    id: payload.id,
    table,
    type,
    payload,
    createdAt: new Date().toISOString(),
  }
  pendingOperations = [...pendingOperations, op]
  savePendingOperations()
}

async function syncPendingOperations() {
  if (!isOnline()) return
  if (pendingOperations.length === 0) return

  const queue = [...pendingOperations]
  const remaining = []

  for (const op of queue) {
    const path = collectionPath(op.table)
    try {
      if (op.type === 'create') {
        await request(path, {
          method: 'POST',
          body: JSON.stringify(op.payload),
        })
      } else if (op.type === 'update') {
        await request(`${path}/${op.payload.id}`, {
          method: 'PUT',
          body: JSON.stringify(op.payload.changes || op.payload),
        })
      }
    } catch (error) {
      console.warn('Failed to sync offline operation', op, error)
      remaining.push(op)
    }
  }

  pendingOperations = remaining
  savePendingOperations()

  if (remaining.length === 0) {
    try {
      await Promise.all([
        reloadCollection('patients'),
        reloadCollection('consultations'),
        reloadCollection('lab_orders'),
        reloadCollection('lab_results'),
        reloadCollection('prescriptions'),
        reloadCollection('triages'),
      ])
      saveCache()
    } catch (error) {
      console.warn('Failed to refresh cache after sync', error)
    }
  }
}

function extractData(table, response) {
  if (!response) return []
  switch (table) {
    case 'patients': return response.patients || []
    case 'consultations': return response.consultations || []
    case 'lab_orders': return response.labOrders || []
    case 'lab_results': return response.labResults || []
    case 'prescriptions': return response.prescriptions || []
    case 'triages': return response.triages || []
    default: return []
  }
}

function collectionPath(table) {
  switch (table) {
    case 'patients': return '/patients'
    case 'consultations': return '/consultations'
    case 'lab_orders': return '/lab/orders'
    case 'lab_results': return '/lab/results'
    case 'prescriptions': return '/prescriptions'
    case 'triages': return '/triages'
    default: return `/${table}`
  }
}

async function reloadCollection(table) {
  const path = collectionPath(table)
  if (!path) return
  const response = await request(path)
  cache[table] = extractData(table, response)
}

export async function initDB() {
  loadStoredCache()
  pendingOperations = loadPendingOperations()

  if (isOnline()) {
    try {
      await syncPendingOperations()
    } catch (error) {
      console.warn('Failed to sync on init', error)
    }
  }

  try {
    await Promise.all([
      reloadCollection('patients'),
      reloadCollection('consultations'),
      reloadCollection('lab_orders'),
      reloadCollection('lab_results'),
      reloadCollection('prescriptions'),
      reloadCollection('triages'),
    ])
    saveCache()
  } catch (error) {
    console.warn('Failed to initialize DB cache from API, continuing with local data', error)
  }

  if (isBrowser()) {
    window.addEventListener('online', () => {
      syncPendingOperations().catch(err => console.warn('Sync after reconnect failed', err))
    })
  }
}

export async function resetDB() {
  await initDB()
}

export function getAll(table) {
  return cache[table] || []
}

export function getById(table, id) {
  return getAll(table).find(item => item.id === id) || null
}

export function query(table, fn) {
  return getAll(table).filter(fn)
}

function updateCache(table, item) {
  const current = getAll(table)
  const index = current.findIndex(record => record.id === item.id)
  if (index === -1) {
    cache[table] = [...current, item]
  } else {
    cache[table] = [...current.slice(0, index), item, ...current.slice(index + 1)]
  }
  saveCache()
}

export function insert(table, record) {
  const idPrefixes = {
    patients: 'PT',
    consultations: 'CONS',
    lab_orders: 'ORD',
    lab_results: 'RES',
    prescriptions: 'RX',
    triages: 'TRI',
  }
  const prefix = idPrefixes[table] || 'ID'
  const id = record.id || generateId(prefix)
  const item = { ...record, id, createdAt: record.createdAt || new Date().toISOString() }
  updateCache(table, item)

  const payload = { ...item }
  if (!isOnline()) {
    queueOperation(table, 'create', payload)
    return item
  }

  switch (table) {
    case 'patients':
      createPatient(payload).catch(error => {
        console.warn(`Offline create queued for ${table}`, error)
        queueOperation(table, 'create', payload)
      })
      break
    case 'consultations':
      createConsultation(payload).catch(error => {
        console.warn(`Offline create queued for ${table}`, error)
        queueOperation(table, 'create', payload)
      })
      break
    case 'lab_orders':
      createLabOrder(payload).catch(error => {
        console.warn(`Offline create queued for ${table}`, error)
        queueOperation(table, 'create', payload)
      })
      break
    case 'lab_results':
      createLabResult(payload).catch(error => {
        console.warn(`Offline create queued for ${table}`, error)
        queueOperation(table, 'create', payload)
      })
      break
    case 'prescriptions':
      createPrescription(payload).catch(error => {
        console.warn(`Offline create queued for ${table}`, error)
        queueOperation(table, 'create', payload)
      })
      break
    case 'triages':
      createTriage(payload).catch(error => {
        console.warn(`Offline create queued for ${table}`, error)
        queueOperation(table, 'create', payload)
      })
      break
    default:
      break
  }

  return item
}

export function update(table, id, changes) {
  const existing = getById(table, id)
  if (!existing) return null
  const updated = { ...existing, ...changes, updatedAt: new Date().toISOString() }
  updateCache(table, updated)

  if (!isOnline()) {
    queueOperation(table, 'update', { id, changes })
    return updated
  }

  switch (table) {
    case 'patients':
      updatePatient(id, changes).catch(error => {
        console.warn(`Offline update queued for ${table}`, error)
        queueOperation(table, 'update', { id, changes })
      })
      break
    case 'consultations':
      updateConsultation(id, changes).catch(error => {
        console.warn(`Offline update queued for ${table}`, error)
        queueOperation(table, 'update', { id, changes })
      })
      break
    case 'lab_orders':
      updateLabOrder(id, changes).catch(error => {
        console.warn(`Offline update queued for ${table}`, error)
        queueOperation(table, 'update', { id, changes })
      })
      break
    case 'lab_results':
      updateLabResult(id, changes).catch(error => {
        console.warn(`Offline update queued for ${table}`, error)
        queueOperation(table, 'update', { id, changes })
      })
      break
    case 'prescriptions':
      updatePrescription(id, changes).catch(error => {
        console.warn(`Offline update queued for ${table}`, error)
        queueOperation(table, 'update', { id, changes })
      })
      break
    default:
      break
  }

  return updated
}

export function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function getStats() {
  const patients = getAll('patients')
  const labReqs = getAll('lab_orders')
  return {
    waiting: patients.filter(p => ['triaged'].includes(p.status)).length,
    resultsReady: patients.filter(p => p.status === 'lab_resulted').length,
    inProgress: patients.filter(p => ['consulting', 'lab_pending', 'sample_collected'].includes(p.status)).length,
    completedToday: patients.filter(p => ['prescribed', 'discharged'].includes(p.status)).length,
    pendingLab: labReqs.filter(r => ['pending', 'sample_collected'].includes(r.status)).length,
    resultedToday: labReqs.filter(r => r.status === 'resulted').length,
  }
}

export function loginUser(roleKey, credentials = {}) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ roleKey, ...credentials }),
  })
}

export function createPatient(payload) {
  if (!isOnline()) {
    queueOperation('patients', 'create', payload)
    return Promise.resolve({ patient: payload })
  }
  return request('/patients', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePatient(id, payload) {
  return request(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function getPatient(id) {
  return getById('patients', id)
}

export function getPatients() {
  return getAll('patients')
}

export function getUsers(role) {
  return request(role ? `/users/${role}` : '/users')
}

export function createUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateUser(id, payload) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteUser(id) {
  return request(`/users/${id}`, {
    method: 'DELETE',
  })
}

export function getLabOrders() {
  return getAll('lab_orders')
}

export function getLabOrderById(id) {
  return getById('lab_orders', id)
}

export function createLabOrder(payload) {
  return request('/lab/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateLabOrder(id, payload) {
  return request(`/lab/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function getLabResults() {
  return getAll('lab_results')
}

export function getLabResultById(id) {
  return getById('lab_results', id)
}

export function createLabResult(payload) {
  return request('/lab/results', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateLabResult(id, payload) {
  return request(`/lab/results/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function getConsultations() {
  return getAll('consultations')
}

export function createConsultation(payload) {
  return request('/consultations', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateConsultation(id, payload) {
  return request(`/consultations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function getTriages() {
  return getAll('triages')
}

export function createTriage(payload) {
  return request('/triages', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getPrescriptions() {
  return getAll('prescriptions')
}

export function createPrescription(payload) {
  return request('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePrescription(id, payload) {
  return request(`/prescriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
