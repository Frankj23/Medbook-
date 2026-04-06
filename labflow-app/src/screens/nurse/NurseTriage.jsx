import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAll, getById, insert, generateId } from '../../services/db'

const CATEGORIES = [
  { key: 'red',    label: 'Red — Immediate',   bg: '#fff0f0', border: '#c62828', text: '#c62828', dot: '#c62828' },
  { key: 'yellow', label: 'Yellow — Urgent',    bg: '#fffbf0', border: '#d97706', text: '#854F0B', dot: '#d97706' },
  { key: 'green',  label: 'Green — Routine',    bg: '#f0faf4', border: '#1a7a4a', text: '#1a7a4a', dot: '#1a7a4a' },
]

export default function NurseTriage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [patient, setPatient] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [vitals, setVitals] = useState({ bp: '', temp: '', pulse: '', weight: '', spo2: '' })
  const [category, setCategory] = useState('green')
  const [saved, setSaved] = useState(null)

  const handleSearch = () => {
    const q = search.trim().toUpperCase()
    const patients = getAll('patients')
    const found = patients.find(p => p.id.toUpperCase() === q || p.name.toLowerCase().includes(search.toLowerCase()))
    if (found) { setPatient(found); setNotFound(false) }
    else        { setPatient(null); setNotFound(true)  }
  }

  useEffect(() => {
    const patientId = location.state?.patientId
    if (patientId) {
      const found = getById('patients', patientId)
      if (found) {
        setPatient(found)
        setSearch(found.id)
        setNotFound(false)
      }
    }
  }, [location.state])

  const setV = k => e => setVitals(p => ({ ...p, [k]: e.target.value }))

  const handleSave = () => {
    const existingTriages = getAll('triages')
    const nextNum = existingTriages.length + 1
    const triage = insert('triages', {
      id: generateId('TRI'),
      patientId: patient.id,
      ...vitals,
      category,
      queueNumber: 'A-' + String(nextNum).padStart(3, '0'),
      by: user ? user.name : 'Nurse',
      createdAt: new Date().toISOString(),
    })
    setSaved(triage)
  }

  const cat = CATEGORIES.find(c => c.key === category)

  if (saved) return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="lf-card" style={{ padding: '52px 48px', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg,#1a7a4a,#2ea86a)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 6px 20px rgba(26,122,74,0.28)' }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1a2b2b', margin: '0 0 8px' }}>Triage Complete</h2>
        <p style={{ color: '#5a7272', fontSize: '14px', margin: '0 0 28px' }}>{patient.name} has been triaged and queued.</p>
        <div style={{ background: '#f0f7f7', borderRadius: '14px', padding: '20px', marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', color: '#8fa8a8', margin: '0 0 6px' }}>QUEUE NUMBER</p>
          <p style={{ fontSize: '40px', fontWeight: '800', color: '#005454', margin: '0 0 14px', letterSpacing: '0.05em' }}>{saved.queueNumber}</p>
          <span style={{ background: cat.bg, color: cat.text, border: `1.5px solid ${cat.border}`, padding: '4px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>
            {cat.label}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setPatient(null); setSearch(''); setVitals({ bp:'', temp:'', pulse:'', weight:'', spo2:'' }); setCategory('green'); setSaved(null) }}>
            Next Patient
          </button>
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate('/register')}>
            Register New
          </button>
        </div>
      </div>
      {/* <Link to="/" className="back-to-index">← All screens</Link> */}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '60px', background: '#fff', borderBottom: '1px solid #e8f2f2', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', border: '1px solid #e8f2f2', background: '#fff', cursor: 'pointer', padding: 0 }} aria-label="Go back">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#005454" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#005454,#0b6e6e)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>L</span>
          </div>
          <span style={{ fontSize: '17px', fontWeight: '700', color: '#1a2b2b' }}>LabFlow</span>
          <span style={{ color: '#dde9e9', margin: '0 4px' }}>|</span>
          <span style={{ fontSize: '14px', color: '#5a7272' }}>Nurse Triage</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#5a7272' }}>{user ? user.name : 'Nurse'}</span>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#0b6e6e,#005454)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>
            {user ? user.initials : 'NU'}
          </div>
        </div>
      </nav>

      <div style={{ padding: '28px 32px', maxWidth: '860px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a2b2b', margin: '0 0 6px' }}>Patient Triage</h1>
        <p style={{ fontSize: '13px', color: '#5a7272', margin: '0 0 28px' }}>Search for a registered patient, capture vitals, and assign triage priority.</p>

        {/* Search */}
        <div className="lf-card" style={{ padding: '20px', marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: '700', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>Find Patient</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8fa8a8' }} width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input className="lf-input" placeholder="Patient ID or name…" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} style={{ paddingLeft: '40px' }} />
            </div>
            <button className="btn-primary" onClick={handleSearch}>Search</button>
          </div>
          <div style={{ marginTop: '10px' }}>
            <Link to="/register" style={{ fontSize: '13px', color: '#005454', fontWeight: '700', textDecoration: 'none' }}>New patient? Register here</Link>
          </div>
          {notFound && <p style={{ fontSize: '13px', color: '#c62828', margin: '10px 0 0' }}>No patient found. Please register the patient first.</p>}
        </div>

        {patient && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px' }}>
            {/* Patient card */}
            <div className="lf-card" style={{ padding: '20px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>{patient.initials}</div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 4px' }}>{patient.name}</h3>
              <p style={{ fontSize: '13px', color: '#5a7272', margin: '0 0 2px' }}>{patient.age} yrs • {patient.gender}</p>
              <p style={{ fontSize: '12px', color: '#8fa8a8', margin: '0 0 16px' }}>{patient.id}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {[['Blood Group', patient.bloodGroup], ['Allergies', patient.allergies], ['emergency Name', patient.emergencyName], ['emergency Contact', patient.emergencyContact]].map(([k,v]) => (
                  <div key={k} style={{ background: '#f0f7f7', borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em' }}>{k}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b', margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
              
            </div>

            {/* Vitals form */}
            <div className="lf-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 20px' }}>Vital Signs</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                {[
                  { key: 'bp',     label: 'Blood Pressure', unit: 'mmHg', placeholder: '120/80' },
                  { key: 'temp',   label: 'Temperature',    unit: '°C',   placeholder: '36.5'   },
                  { key: 'pulse',  label: 'Pulse Rate',     unit: 'bpm',  placeholder: '72'     },
                  { key: 'weight', label: 'Weight',         unit: 'kg',   placeholder: '70'     },
                  { key: 'spo2',   label: 'SpO₂',           unit: '%',    placeholder: '98' },
                  {key: 'bmi',     label: 'BMI',            unit: 'kg/m2',     placeholder: '22.5'},
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <input className="lf-input" placeholder={f.placeholder} value={vitals[f.key]} onChange={setV(f.key)} style={{ paddingRight: '48px' }} />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '11px', fontWeight: '700', color: '#8fa8a8' }}>{f.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '10px' }}>Triage Category</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {CATEGORIES.map(c => (
                    <button key={c.key} onClick={() => setCategory(c.key)} style={{ flex: 1, padding: '12px 8px', borderRadius: '10px', border: `2px solid ${category === c.key ? c.border : '#e0ecec'}`, background: category === c.key ? c.bg : '#fff', color: category === c.key ? c.text : '#5a7272', fontWeight: '700', fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.dot, display: 'block' }} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', background: '#e8f2f2', marginBottom: '20px' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-amber" onClick={handleSave}>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Assign Queue Number
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* <Link to="/" className="back-to-index">← All screens</Link> */}
    </div>
  )
}

