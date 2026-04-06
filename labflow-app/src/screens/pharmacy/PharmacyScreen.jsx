import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const mockPrescriptions = [
  {
    id: 'RX001',
    patient: {
      name: 'John Doe',
      id: 'P001',
      age: 45,
      sex: 'Male'
    },
    diagnosis: 'Malaria',
    medications: [
      {
        name: 'Artemether-Lumefantrine',
        dosage: '80/480mg',
        frequency: 'Twice daily',
        duration: '3 days',
        dispensedQuantity: '',
        status: 'Pending',
        substitute: '',
        note: ''
      }
    ],
    status: 'Pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'RX002',
    patient: {
      name: 'Jane Smith',
      id: 'P002',
      age: 32,
      sex: 'Female'
    },
    diagnosis: 'Hypertension',
    medications: [
      {
        name: 'Amlodipine',
        dosage: '5mg',
        frequency: 'Once daily',
        duration: '30 days',
        dispensedQuantity: '',
        status: 'Pending',
        substitute: '',
        note: ''
      },
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        dispensedQuantity: '',
        status: 'Pending',
        substitute: '',
        note: ''
      }
    ],
    status: 'Processing',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
]

export default function PharmacyScreen() {
  const navigate = useNavigate()
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions)
  const [updatedMedications, setUpdatedMedications] = useState({})
  const [generalNote, setGeneralNote] = useState('')

  const handleSelectPrescription = (prescription) => {
    setSelectedPrescription(prescription)
    setUpdatedMedications(prescription.medications.reduce((acc, med, i) => {
      acc[i] = { ...med }
      return acc
    }, {}))
    setGeneralNote('')
  }

  const updateMedication = (index, key, value) => {
    setUpdatedMedications(prev => ({
      ...prev,
      [index]: { ...prev[index], [key]: value }
    }))
  }

  const handleConfirm = () => {
    // Update prescription status and medications
    const updatedPrescription = {
      ...selectedPrescription,
      medications: Object.values(updatedMedications),
      status: 'Completed',
      pharmacyNote: generalNote
    }
    setPrescriptions(prev => prev.map(p => p.id === selectedPrescription.id ? updatedPrescription : p))
    setSelectedPrescription(updatedPrescription)
    // Trigger notifyDoctor callback
    notifyDoctor(selectedPrescription.id, 'Completed')
    alert('Prescription confirmed and doctor notified!')
  }

  const notifyDoctor = (prescriptionId, status) => {
    console.log(`Notifying doctor about prescription ${prescriptionId} with status ${status}`)
    // In real app, this would be an API call
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#d97706'
      case 'Processing': return '#2563eb'
      case 'Completed': return '#16a34a'
      default: return '#6b7280'
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f6fafa' }}>
      {/* Left Panel - Prescription Queue */}
      <div style={{ width: '320px', background: '#fff', borderRight: '1px solid #e8f2f2', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e8f2f2' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>Prescription Queue</h2>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {prescriptions.map(prescription => (
            <div
              key={prescription.id}
              onClick={() => handleSelectPrescription(prescription)}
              style={{
                padding: '16px',
                marginBottom: '8px',
                borderRadius: '12px',
                background: selectedPrescription?.id === prescription.id ? '#f0f7f7' : '#fff',
                border: selectedPrescription?.id === prescription.id ? '1px solid #005454' : '1px solid #e8f2f2',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a2b2b', margin: 0 }}>{prescription.patient.name}</p>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#fff',
                  background: getStatusColor(prescription.status),
                  textTransform: 'uppercase'
                }}>
                  {prescription.status}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#8fa8a8', margin: '0 0 4px' }}>ID: {prescription.patient.id}</p>
              <p style={{ fontSize: '11px', color: '#8fa8a8', margin: 0 }}>
                {new Date(prescription.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Prescription Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '60px', background: '#fff', borderBottom: '1px solid #e8f2f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#005454', fontWeight: '600', fontSize: '13px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Dashboard
            </button>
            <span style={{ color: '#e0ecec' }}>|</span>
            <span style={{ fontSize: '17px', fontWeight: '800', color: '#005454' }}>LabFlow</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#5a7272' }}>Pharmacy</span>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>PH</div>
          </div>
        </nav>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {selectedPrescription ? (
            <>
              {/* Patient Info */}
              <div className="lf-card" style={{ padding: '18px', marginBottom: '20px' }}>
                <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>PATIENT INFORMATION</p>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 10px' }}>{selectedPrescription.patient.name}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div><p style={{ fontSize: '11px', color: '#8fa8a8', margin: '0 0 2px' }}>AGE/SEX</p><p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b', margin: 0 }}>{selectedPrescription.patient.age} / {selectedPrescription.patient.sex}</p></div>
                  <div><p style={{ fontSize: '11px', color: '#8fa8a8', margin: '0 0 2px' }}>PATIENT ID</p><p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b', margin: 0 }}>{selectedPrescription.patient.id}</p></div>
                </div>
                <div style={{ background: '#f0f7f7', borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ fontSize: '11px', color: '#8fa8a8', margin: '0 0 3px' }}>Diagnosis</p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#005454', margin: 0 }}>{selectedPrescription.diagnosis}</p>
                </div>
              </div>

              {/* Medications */}
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 14px' }}>Medications</h3>
                {Object.values(updatedMedications).map((med, i) => (
                  <div key={i} className="lf-card" style={{ padding: '18px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>{med.name}</h4>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#fff',
                        background: getStatusColor(med.status),
                        textTransform: 'uppercase'
                      }}>
                        {med.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div><p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 4px' }}>DOSAGE</p><p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b' }}>{med.dosage}</p></div>
                      <div><p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 4px' }}>FREQUENCY</p><p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b' }}>{med.frequency}</p></div>
                      <div><p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 4px' }}>DURATION</p><p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b' }}>{med.duration}</p></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 4px' }}>DISPENSED QUANTITY</p>
                        <input
                          type="number"
                          value={med.dispensedQuantity}
                          onChange={(e) => updateMedication(i, 'dispensedQuantity', e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8f2f2', borderRadius: '6px', fontSize: '13px' }}
                          placeholder="e.g. 30"
                        />
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 4px' }}>STATUS</p>
                        <select
                          value={med.status}
                          onChange={(e) => updateMedication(i, 'status', e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8f2f2', borderRadius: '6px', fontSize: '13px' }}
                        >
                          <option value="Dispensed">Dispensed</option>
                          <option value="Partial">Partial</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 4px' }}>SUBSTITUTE (IF NEEDED)</p>
                      <input
                        value={med.substitute}
                        onChange={(e) => updateMedication(i, 'substitute', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8f2f2', borderRadius: '6px', fontSize: '13px' }}
                        placeholder="Alternative medication"
                      />
                    </div>
                    <div>
                      <p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 4px' }}>NOTES</p>
                      <textarea
                        value={med.note}
                        onChange={(e) => updateMedication(i, 'note', e.target.value)}
                        rows={2}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8f2f2', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pharmacy Actions */}
              <div className="lf-card" style={{ padding: '18px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 14px' }}>Pharmacy Actions</h3>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <button style={{ padding: '10px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    ✅ Dispense All
                  </button>
                  <button style={{ padding: '10px 16px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    ⚠️ Partial Fulfillment
                  </button>
                  <button style={{ padding: '10px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    ❌ Reject Prescription
                  </button>
                </div>
                <div>
                  <p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 4px' }}>GENERAL PHARMACY NOTE</p>
                  <textarea
                    value={generalNote}
                    onChange={(e) => setGeneralNote(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e8f2f2', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }}
                    placeholder="General notes for the prescription"
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div style={{ borderTop: '1px solid #e8f2f2', padding: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', position: 'sticky', bottom: 0 }}>
                <button style={{ padding: '10px 20px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                  Save Draft
                </button>
                <button
                  onClick={handleConfirm}
                  style={{ padding: '10px 20px', background: '#005454', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                >
                  Confirm & Notify Doctor
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <p style={{ fontSize: '16px', color: '#8fa8a8' }}>Select a prescription from the queue to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}