import { getCollection, createDocument, updateDocument } from '../services/firestore.service.js'

export async function listPrescriptions(req, res) {
  const patientId = req.query.patientId
  let prescriptions = await getCollection('prescriptions')
  if (patientId) {
    prescriptions = prescriptions.filter(p => p.patientId === patientId)
  }
  return res.json({ prescriptions })
}

export async function getPrescriptionById(req, res) {
  const { id } = req.params
  const prescription = await getCollection('prescriptions').then(list => list.find(p => p.id === id))
  if (!prescription) {
    return res.status(404).json({ error: 'Prescription not found' })
  }
  return res.json({ prescription })
}

export async function createPrescription(req, res) {
  const payload = req.body
  if (!payload.patientId || !payload.medications) {
    return res.status(400).json({ error: 'patientId and medications are required' })
  }
  const prescription = await createDocument('prescriptions', {
    ...payload,
    status: payload.status || 'sent',
  })
  return res.status(201).json({ prescription })
}

export async function updatePrescription(req, res) {
  const { id } = req.params
  const updates = req.body
  const prescription = await updateDocument('prescriptions', id, updates)
  if (!prescription) {
    return res.status(404).json({ error: 'Prescription not found' })
  }
  return res.json({ prescription })
}
