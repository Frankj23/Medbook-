import { useNavigate, Link } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext'

const FALLBACK_SYMPTOMS = 'Patient reports persistent high fever for 3 days, accompanied by chills, severe headache, and joint pain. No signs of respiratory distress.'
const FALLBACK_DIAGNOSIS = 'Suspected Malaria / Viral Fever'
const FALLBACK_TESTS = ['Full Blood Count', 'Malaria Test']

export default function RequestConfirmation() {
  const navigate = useNavigate()
  const { patient, consultation } = usePatient()

  const symptoms  = consultation.symptoms  || FALLBACK_SYMPTOMS
  const diagnosis = consultation.diagnosis || FALLBACK_DIAGNOSIS
  const tests     = consultation.selectedTests.length > 0 ? consultation.selectedTests : FALLBACK_TESTS

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: '64px', background: '#fff',
        borderBottom: '1px solid #e8f2f2', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', background: 'linear-gradient(135deg,#005454,#0b6e6e)',
            borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>L</span>
          </div>
          <span style={{ fontSize: '17px', fontWeight: '700', color: '#1a2b2b' }}>Doctor Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#5a7272' }}>Dr. Sarah Mbi</span>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: '#e0f2f2', border: '2px solid #b0d8d8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', color: '#005454',
          }}>SJ</div>
        </div>
      </nav>

      <div style={{ padding: '24px 32px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto 24px' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg style={{ position: 'absolute', left: '14px', color: '#8fa8a8' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input defaultValue={patient.id} className="lf-input" style={{ paddingLeft: '40px' }} readOnly />
          </div>
          <button style={{
            background: 'linear-gradient(135deg,#005454,#0b6e6e)', color: '#fff', border: 'none',
            padding: '12px 22px', borderRadius: '12px', fontWeight: '600', fontSize: '14px',
            cursor: 'default', opacity: 0.7, fontFamily: 'Inter, sans-serif',
          }}>Search</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Patient */}
          <div className="lf-card" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
              <span style={{ background: '#e0f2f2', color: '#005454', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600' }}>
                MedBook+
              </span>
            </div>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#1a2b2b,#2c4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '12px',
            }}>{patient.initials}</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 4px' }}>{patient.name}</h3>
            <p style={{ color: '#5a7272', fontSize: '13px', margin: '0 0 2px' }}>{patient.age} yrs • {patient.gender}</p>
            <p style={{ color: '#8fa8a8', fontSize: '12px', margin: 0 }}>ID: {patient.id}</p>
          </div>

          {/* Confirmation panel */}
          <div className="lf-card" style={{ padding: '28px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
              <div style={{
                background: 'linear-gradient(135deg,#005454,#0b6e6e)', color: '#fff',
                padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '7px',
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
                Consultation Logged
              </div>
            </div>

            <div style={{ marginBottom: '18px', paddingRight: '200px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Presenting Symptoms
              </p>
              <div style={{
                background: '#f8fbfb', borderRadius: '10px', padding: '14px 16px',
                border: '1.5px solid #e8f2f2', fontSize: '14px', color: '#1a2b2b', lineHeight: 1.6,
              }}>
                {symptoms}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Preliminary Diagnosis
              </p>
              <div style={{
                background: '#f8fbfb', borderRadius: '10px', padding: '12px 16px',
                border: '1.5px solid #e8f2f2', fontSize: '14px', color: '#1a2b2b',
              }}>
                {diagnosis}
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                Lab Tests Requested
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {tests.map(t => (
                  <div key={t} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '11px 14px', borderRadius: '10px',
                    background: '#e6f4f4', border: '1.5px solid #005454',
                  }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#005454" strokeWidth="3">
                      <path d="M5 13l4 4L19 7"/>
                    </svg>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#005454' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: '#e8f2f2', marginBottom: '20px' }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button className="btn-ghost" onClick={() => navigate('/doctor/dashboard')}>
                Start New Consultation
              </button>
              <button className="btn-amber">
                <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/>
                </svg>
                Lab Request Sent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <Link to="/" className="back-to-index">← All screens</Link> */}
    </div>
  )
}

