import * as api from '../services/db.js'

export const db = {
  getCurrentUser() {
    return null
  },
  setCurrentUser() {},
  clearCurrentUser() {},

  getPatients() {
    return api.getPatients()
  },
  getPatient(id) {
    return api.getById('patients', id)
  },
  searchPatients(query) {
    const q = query.toLowerCase()
    return api.getPatients().filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
  },
  savePatient(data) {
    return api.insert('patients', data)
  },
  updatePatient(id, updates) {
    return api.update('patients', id, updates)
  },

  getConsultations() {
    return api.getAll('consultations')
  },
  getConsultationByPatient(patientId) {
    return api.getAll('consultations').filter(c => c.patientId === patientId)
  },
  getLatestConsultation(patientId) {
    const consultations = api.getAll('consultations').filter(c => c.patientId === patientId)
    return consultations[consultations.length - 1] || null
  },
  saveConsultation(data) {
    return api.insert('consultations', data)
  },
  updateConsultation(id, updates) {
    return api.update('consultations', id, updates)
  },

  getLabRequests() {
    return api.getAll('lab_orders')
  },
  getPendingLabRequests() {
    return api.getAll('lab_orders').filter(r => r.status !== 'resulted')
  },
  getLabRequestByPatient(patientId) {
    return api.getAll('lab_orders').filter(r => r.patientId === patientId)
  },
  getLatestLabRequest(patientId) {
    const reqs = api.getAll('lab_orders').filter(r => r.patientId === patientId)
    return reqs[reqs.length - 1] || null
  },
  saveLabRequest(data) {
    return api.insert('lab_orders', data)
  },
  updateLabRequest(id, updates) {
    return api.update('lab_orders', id, updates)
  },

  getPrescriptions() {
    return api.getAll('prescriptions')
  },
  savePrescription(data) {
    return api.insert('prescriptions', data)
  },

  getStats() {
    const patients = api.getPatients()
    const labReqs = api.getAll('lab_orders')
    return {
      waiting: patients.filter(p => ['triaged'].includes(p.status)).length,
      resultsReady: patients.filter(p => p.status === 'lab_resulted').length,
      inProgress: patients.filter(p => ['consulting','lab_pending','sample_collected'].includes(p.status)).length,
      completedToday: patients.filter(p => ['prescribed','discharged'].includes(p.status)).length,
      pendingLab: labReqs.filter(r => ['pending','sample_collected'].includes(r.status)).length,
      resultedToday: labReqs.filter(r => r.status === 'resulted').length,
    }
  },
}
