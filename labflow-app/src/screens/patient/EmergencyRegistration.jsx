import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { insert, generateId } from '../../services/db'
import { usePatient } from '../../context/PatientContext'

export default function EmergencyRegistration() {
  const navigate = useNavigate()
  const { setPatient } = usePatient()
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    condition: '',
    arrivalTime: new Date().toISOString().slice(0, 16) // Current time in datetime-local format
  })

  const handleSubmit = () => {
    const id = 'EMG-' + generateId('PT').slice(3) // Replace PT with EMG prefix
    const payload = {
      id,
      isEmergency: true,
      name: form.name || 'Emergency Patient',
      age: form.age ? parseInt(form.age) : null,
      gender: form.gender,
      condition: form.condition || 'Unknown condition',
      arrivalTime: new Date(form.arrivalTime),
      status: 'UNDER_TREATMENT',
      createdAt: new Date().toISOString()
    }

    const saved = insert('patients', payload)
    setPatient(saved)
    navigate('/doctor/dashboard', { state: { patientId: saved.id } })
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '56px', background: 'linear-gradient(135deg,#c62828,#d32f2f)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', padding: 0 }} aria-label="Go back">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <span style={{ color: '#fff', fontSize: '20px' }}>🚑</span>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '700' }}>LabFlow</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '500' }}>Emergency Registration</span>
      </nav>

      <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
        <div className="lf-card" style={{ width: '100%', maxWidth: '520px', padding: '32px', border: '2px solid #c62828', background: '#fff9f9' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#c62828,#d32f2f)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 20px rgba(198,40,40,0.28)' }}>
              <span style={{ fontSize: '28px' }}>🚑</span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#c62828', margin: '0 0 8px' }}>Emergency Patient</h2>
            <p style={{ color: '#5a7272', fontSize: '14px', margin: 0 }}>Quick registration for immediate care</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '8px' }}>Temporary Name</label>
              <input
                className="lf-input"
                value={form.name}
                onChange={set('name')}
                placeholder="e.g. Unknown Male, Accident Victim"
                style={{ fontSize: '16px', padding: '16px 14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '8px' }}>Estimated Age</label>
              <input
                className="lf-input"
                type="number"
                value={form.age}
                onChange={set('age')}
                placeholder="Enter estimated age"
                style={{ fontSize: '16px', padding: '16px 14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '8px' }}>Gender *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Male', 'Female', 'Unknown'].map(g => (
                  <button
                    key={g}
                    onClick={() => setForm(p => ({ ...p, gender: g }))}
                    style={{
                      flex: 1,
                      padding: '14px 8px',
                      borderRadius: '10px',
                      border: `2px solid ${form.gender === g ? '#c62828' : '#e0ecec'}`,
                      background: form.gender === g ? '#ffeaea' : '#fff',
                      color: form.gender === g ? '#c62828' : '#5a7272',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif'
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '8px' }}>Condition</label>
              <input
                className="lf-input"
                value={form.condition}
                onChange={set('condition')}
                placeholder="e.g. Road accident, unconscious"
                style={{ fontSize: '16px', padding: '16px 14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '8px' }}>Arrival Time</label>
              <input
                className="lf-input"
                type="datetime-local"
                value={form.arrivalTime}
                onChange={set('arrivalTime')}
                style={{ fontSize: '16px', padding: '16px 14px' }}
              />
            </div>
          </div>

          <div style={{ height: '1px', background: '#e8f2f2', margin: '32px 0' }} />

          <button
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '16px',
              background: 'linear-gradient(135deg,#c62828,#d32f2f)',
              border: 'none'
            }}
            onClick={handleSubmit}
            disabled={!form.gender}
          >
            Register Emergency Patient
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '8px' }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#005454',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Switch to Full Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}