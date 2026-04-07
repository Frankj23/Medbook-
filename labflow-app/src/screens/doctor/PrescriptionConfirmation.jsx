import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext'
import { query } from '../../services/db'

export default function PrescriptionConfirmation() {
  const navigate = useNavigate()
  const { patient } = usePatient()
  const [prescription, setPrescription] = useState(null)
  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!patient?.id) {
      setLoading(false)
      return
    }

    const prescriptions = query('prescriptions', p => p.patientId === patient.id)
    const latestPrescription = prescriptions[prescriptions.length - 1]
    
    if (latestPrescription) {
      setPrescription(latestPrescription)
      const consultations = query('consultations', c => c.patientId === patient.id)
      const latestConsultation = consultations[consultations.length - 1]
      setConsultation(latestConsultation)
    }

    setLoading(false)
  }, [patient?.id])

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: '60px', background: '#fff',
        borderBottom: '1px solid #e8f2f2',
      }}>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#005454' }}>LabFlow</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#5a7272' }}>{patient?.name || 'Dr. Unknown'}</span>
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg,#005454,#0b6e6e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: '700', color: '#fff',
          }}>{patient?.initials || 'DR'}</div>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        {loading ? (
          <div className="lf-card" style={{ width: '100%', maxWidth: '580px', padding: '52px 48px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#5a7272' }}>Loading prescription details…</p>
          </div>
        ) : !prescription ? (
          <div className="lf-card" style={{ width: '100%', maxWidth: '580px', padding: '52px 48px', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#8fa8a8', marginBottom: '20px' }}>No prescription found for this patient.</p>
            <button className="btn-primary" onClick={() => navigate('/doctor/dashboard')}>← Return to Dashboard</button>
          </div>
        ) : (
          <div className="lf-card" style={{ width: '100%', maxWidth: '580px', padding: '52px 48px', textAlign: 'center' }}>

            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#1a7a4a,#2ea86a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 22px',
              boxShadow: '0 6px 20px rgba(26,122,74,0.28)',
            }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                <path d="M5 13l4 4L19 7"/>
              </svg>
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1a2b2b', margin: '0 0 12px' }}>
              Prescription Sent Successfully
            </h2>
            <p style={{ fontSize: '14px', color: '#5a7272', margin: '0 0 32px', lineHeight: 1.6 }}>
              The medication order for{' '}
              <strong style={{ color: '#1a2b2b' }}>{patient?.name}</strong>{' '}
              has been routed to{' '}
              <strong style={{ color: '#005454' }}>City Health Pharmacy</strong>.
            </p>

            <div style={{
              background: '#f8fbfb', borderRadius: '14px',
              border: '1.5px solid #e8f2f2',
              padding: '20px', marginBottom: '28px', textAlign: 'left',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#005454" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  ORDER SUMMARY
                </span>
              </div>

              {prescription.medications && prescription.medications.length > 0 ? (
                prescription.medications.map((med, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: '#fff', borderRadius: '10px', padding: '14px 16px',
                    marginBottom: i < prescription.medications.length - 1 ? '8px' : '0',
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a2b2b', margin: '0 0 3px' }}>
                        {med.name} {med.dosage ? `${med.dosage}` : ''}
                      </p>
                      <p style={{ fontSize: '12px', color: '#5a7272', margin: 0 }}>
                        {med.frequency || 'As prescribed'} {med.duration ? `for ${med.duration}` : ''}
                      </p>
                    </div>
                    <span style={{
                      background: 'linear-gradient(135deg,#005454,#0b6e6e)', color: '#fff',
                      padding: '4px 12px', borderRadius: '999px',
                      fontSize: '12px', fontWeight: '700', flexShrink: 0,
                    }}>
                      {med.dispensedQuantity || 'TBD'}
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ fontSize: '12px', color: '#8fa8a8', margin: 0 }}>No medications in this prescription.</p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #e8f2f2' }}>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>PRESCRIPTION ID</p>
                  <p style={{ fontSize: '13px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>{prescription.id || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>STATUS</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: prescription.status === 'Completed' ? '#1a7a4a' : '#854F0B', margin: 0 }}>
                    {prescription.status || 'Pending'}
                  </p>
                </div>
              </div>
            </div>


            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px' }}>
              <button className="btn-ghost" onClick={() => navigate('/doctor/dashboard')}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Return to Dashboard
              </button>
              <button className="btn-amber" style={{ padding: '13px 28px' }} onClick={() => window.print()}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print Summary
              </button>
            </div>
          </div>
        )}
      </div>

      <footer style={{
        borderTop: '1px solid #e8f2f2', padding: '16px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '28px', background: '#fff',
      }}>
        {[
          { icon: '🛡️', text: 'HIPAA COMPLIANT' },
          { icon: '🔒', text: 'SECURE TRANSMISSION' },
          { icon: '©️', text: '2025 LABFLOW SYSTEMS' },
        ].map(item => (
          <span key={item.text} style={{ fontSize: '11px', fontWeight: '600', color: '#8fa8a8', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '5px' }}>
            {item.icon} {item.text}
          </span>
        ))}
      </footer>

      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

