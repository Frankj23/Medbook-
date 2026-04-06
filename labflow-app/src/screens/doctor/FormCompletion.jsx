import { useNavigate, Link } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext'

const FALLBACK_SYMPTOMS = 'Patient presents with a 3-day history of high fever, chills, and generalised body ache. Reports mild nausea but no vomiting. Denies recent travel. Suspect parasitic infection given regional prevalence.'
const FALLBACK_DIAGNOSIS = 'Suspected Malaria / Viral Fever'
const FALLBACK_TESTS = ['Full Blood Count', 'Malaria Test']

export default function FormCompletion() {
  const navigate = useNavigate()
  const { patient, consultation } = usePatient()

  const symptoms  = consultation.symptoms  || FALLBACK_SYMPTOMS
  const diagnosis = consultation.diagnosis || FALLBACK_DIAGNOSIS
  const tests     = consultation.selectedTests.length > 0 ? consultation.selectedTests : FALLBACK_TESTS

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px 0 16px', height: '64px', background: '#fff',
        borderBottom: '1px solid #e8f2f2', position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => navigate('/doctor/consultation')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#005454', fontWeight: '600', fontSize: '14px', padding: '6px 0' }}
          >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
          <div style={{ width: '1px', height: '20px', background: '#e0ecec' }} />
          <span style={{ fontSize: '17px', fontWeight: '700', color: '#1a2b2b' }}>Doctor Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#5a7272' }}>Dr. Sarah Jenkins</span>
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: '#e0f2f2', border: '2px solid #b0d8d8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', color: '#005454',
          }}>SJ</div>
        </div>
      </nav>

      <div style={{ padding: '20px 32px 0', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '10px', maxWidth: '500px', margin: '0 auto 24px' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg style={{ position: 'absolute', left: '14px', color: '#8fa8a8' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input defaultValue={patient.id} className="lf-input" style={{ paddingLeft: '40px' }} readOnly />
          </div>
          <button style={{
            background: '#e8f2f2', color: '#5a7272', border: 'none',
            padding: '12px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'default',
            fontFamily: 'Inter, sans-serif',
          }}>Searched</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Patient sidebar */}
          <div className="lf-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#1a2b2b,#2c4444)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: '700', color: '#fff',
              }}>{patient.initials}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1a2b2b' }}>{patient.name.split(' ')[0]} {patient.name.split(' ')[1]?.slice(0,4)}…</span>
                  <span style={{
                    background: '#e0f2f2', color: '#005454',
                    padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: '600',
                  }}>✓ MedBook+</span>
                </div>
                <p style={{ color: '#5a7272', fontSize: '12px', margin: '0' }}>{patient.age} yrs • {patient.gender}</p>
                <p style={{ color: '#8fa8a8', fontSize: '11px', margin: '2px 0 0' }}>ID: {patient.id}</p>
              </div>
            </div>

            <div style={{ background: '#f0f7f7', borderRadius: '12px', padding: '14px' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px' }}>VITALS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#5a7272' }}>BP</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a2b2b' }}>{patient.vitals.bp}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#5a7272' }}>Temp</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a2b2b' }}>
                    {patient.vitals.temp} <span style={{ color: '#fea619', fontSize: '11px', fontWeight: '700' }}>High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes panel — reads from context */}
          <div className="lf-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '28px', height: '28px', background: 'linear-gradient(135deg,#005454,#0b6e6e)',
                borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '19px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>Consultation Notes</h2>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '8px' }}>
                Presenting Symptoms
              </label>
              <div style={{
                background: '#f8fbfb', borderRadius: '12px', padding: '16px',
                border: '1.5px solid #e0ecec', fontSize: '14px', color: '#1a2b2b', lineHeight: 1.6,
              }}>
                {symptoms}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '8px' }}>
                Preliminary Diagnosis
              </label>
              <div style={{
                background: '#f8fbfb', borderRadius: '12px', padding: '14px 16px',
                border: '1.5px solid #e0ecec', fontSize: '14px', color: '#1a2b2b',
              }}>
                {diagnosis}
              </div>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272' }}>Lab Tests Requested</label>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#005454' }}>{tests.length} Selected</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {tests.map(t => (
                  <div key={t} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 14px', borderRadius: '10px',
                    background: '#e6f4f4', border: '1.5px solid #005454',
                  }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: '#005454',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3">
                        <path d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#005454' }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', background: '#e8f2f2', marginBottom: '20px' }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-amber" onClick={() => navigate('/doctor/consultation/confirmed')}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                Send to Lab
              </button>
            </div>
          </div>
        </div>
      </div>

      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

