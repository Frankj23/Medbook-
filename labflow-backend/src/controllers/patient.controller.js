import { createDocument, getCollection, getDocument, updateDocument } from '../services/firestore.service.js'
import { generatePatientId } from '../utils/idGenerator.js'

export async function listPatients(req, res) {
  const search = req.query.search
  let patients = await getCollection('patients')
  if (search) {
    const q = search.toLowerCase()
    patients = patients.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
  }
  return res.json({ patients })
}

export async function getPatientById(req, res) {
  const { id } = req.params
  const patient = await getDocument('patients', id)
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' })
  }
  return res.json({ patient })
}

export async function createPatient(req, res) {
  const payload = req.body
  if (!payload.name || !payload.dob) {
    return res.status(400).json({ error: 'Patient name and dob are required' })
  }

  const id = payload.id || generatePatientId()
  const initials = payload.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  const patient = await createDocument('patients', {
    id,
    role: 'patient',
    name: payload.name,
    initials,
    age: payload.age || 0,
    gender: payload.gender || 'Unknown',
    phone: payload.phone || '',
    dob: payload.dob,
    bloodGroup: payload.bloodGroup || 'Unknown',
    address: payload.address || '',
    allergies: payload.allergies || 'None known',
    emergencyContact: payload.emergencyContact || '',
    nhis: payload.nhis || `NHIS-${Math.floor(Math.random() * 9000) + 1000}`,
  })

  return res.status(201).json({ patient })
}

export async function updatePatient(req, res) {
  const { id } = req.params
  const updates = req.body
  const patient = await updateDocument('patients', id, updates)
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' })
  }
  return res.json({ patient })
}
