import { getCollection, createDocument } from '../services/firestore.service.js'

export async function listTriages(req, res) {
  let triages = await getCollection('triages')
  const patientId = req.query.patientId
  if (patientId) {
    triages = triages.filter(t => t.patientId === patientId)
  }
  return res.json({ triages })
}

export async function createTriage(req, res) {
  const payload = req.body
  if (!payload.patientId || !payload.bp) {
    return res.status(400).json({ error: 'patientId and bp are required' })
  }
  const triage = await createDocument('triages', {
    ...payload,
    category: payload.category || 'green',
    queueNumber: payload.queueNumber || 'A-000',
    by: payload.by || 'Nurse',
  })
  return res.status(201).json({ triage })
}
