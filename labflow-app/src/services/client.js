const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

function buildUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

function getAuthToken() {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null
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

export function loginUser(id, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ id, password }),
  })
}

export function createPatient(payload) {
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
  return request(`/patients/${id}`)
}

export function getPatients() {
  return request('/patients')
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
  return request('/lab/orders')
}

export function getLabOrderById(id) {
  return request(`/lab/orders/${id}`)
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
  return request('/lab/results')
}

export function getLabResultById(id) {
  return request(`/lab/results/${id}`)
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

export function getConsultations(query) {
  return request('/consultations' + (query ? `?${new URLSearchParams(query)}` : ''))
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

export function getTriages(query) {
  return request('/triages' + (query ? `?${new URLSearchParams(query)}` : ''))
}

export function createTriage(payload) {
  return request('/triages', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getPrescriptions(query) {
  return request('/prescriptions' + (query ? `?${new URLSearchParams(query)}` : ''))
}

export function createPrescription(payload) {
  return request('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
