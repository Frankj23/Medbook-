import { createDocument, getCollection, getDocument, queryCollection, updateDocument } from '../services/firestore.service.js'
import { generateAccessId } from '../utils/idGenerator.js'

export async function listLabOrders(req, res) {
  const status = req.query.status
  const patientId = req.query.patientId
  let labOrders = await getCollection('lab_orders')
  if (status) {
    labOrders = labOrders.filter(order => order.status === status)
  }
  if (patientId) {
    labOrders = labOrders.filter(order => order.patientId === patientId)
  }
  return res.json({ labOrders })
}

export async function getLabOrderById(req, res) {
  const { id } = req.params
  const order = await getDocument('lab_orders', id)
  if (!order) {
    return res.status(404).json({ error: 'Lab order not found' })
  }
  return res.json({ labOrder: order })
}

export async function createLabOrder(req, res) {
  const payload = req.body
  if (!payload.patientId || !Array.isArray(payload.tests)) {
    return res.status(400).json({ error: 'patientId and tests are required' })
  }

  const labOrder = await createDocument('lab_orders', {
    id: payload.id,
    patientId: payload.patientId,
    consultationId: payload.consultationId || null,
    tests: payload.tests,
    requestedBy: payload.requestedBy || 'Unknown',
    requestedAt: new Date().toISOString(),
    status: payload.status || 'pending_collection',
    stat: !!payload.stat,
    accessionId: payload.accessionId || generateAccessId(),
    collectedBy: payload.collectedBy || null,
    collectedAt: payload.collectedAt || null,
  })

  return res.status(201).json({ labOrder })
}

export async function updateLabOrder(req, res) {
  const { id } = req.params
  const updates = req.body
  const order = await updateDocument('lab_orders', id, updates)
  if (!order) {
    return res.status(404).json({ error: 'Lab order not found' })
  }
  return res.json({ labOrder: order })
}

export async function listLabResults(req, res) {
  const patientId = req.query.patientId
  const reviewed = req.query.reviewed
  let labResults = await getCollection('lab_results')
  if (typeof reviewed !== 'undefined') {
    const reviewedFlag = reviewed === 'true'
    labResults = labResults.filter(result => !!result.reviewedByDoctor === reviewedFlag)
  }
  if (patientId) {
    labResults = labResults.filter(result => result.patientId === patientId)
  }
  return res.json({ labResults })
}

export async function getLabResultById(req, res) {
  const { id } = req.params
  const result = await getDocument('lab_results', id)
  if (!result) {
    return res.status(404).json({ error: 'Lab result not found' })
  }
  return res.json({ labResult: result })
}

export async function createLabResult(req, res) {
  const payload = req.body
  if (!payload.labOrderId || !payload.patientId || !Array.isArray(payload.results)) {
    return res.status(400).json({ error: 'labOrderId, patientId, and results are required' })
  }

  const labResult = await createDocument('lab_results', {
    id: payload.id,
    labOrderId: payload.labOrderId,
    patientId: payload.patientId,
    results: payload.results,
    techNotes: payload.techNotes || '',
    submittedBy: payload.submittedBy || 'Lab Technician',
    submittedAt: new Date().toISOString(),
    reviewedByDoctor: !!payload.reviewedByDoctor,
  })

  return res.status(201).json({ labResult })
}

export async function updateLabResult(req, res) {
  const { id } = req.params
  const updates = req.body
  const result = await updateDocument('lab_results', id, updates)
  if (!result) {
    return res.status(404).json({ error: 'Lab result not found' })
  }
  return res.json({ labResult: result })
}
