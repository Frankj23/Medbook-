import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { insert, generateId } from '../../services/db'
import { usePatient } from '../../context/PatientContext'

export default function PatientRegistration() {
  const navigate = useNavigate()
  const { setPatient } = usePatient()
  const [form, setForm] = useState({ fullName: '', phone: '', dob: '', gender: 'Female', address: '', bloodGroup: 'O+', allergies: '', emergencyName: '', emergencyContact: '' })
  const [submitted, setSubmitted] = useState(false)
  const [savedId, setSavedId] = useState(null)

  const errors = submitted ? {
    fullName: !form.fullName.trim() ? 'Full name is required' : '',
    dob:      !form.dob          ? 'Date of birth is required' : '',
    address:  !form.address.trim() ? 'Address is required' : '',
  } : {}

  const hasErrors = Object.values(errors).some(Boolean)

  const handleSubmit = async () => {
    setSubmitted(true)
    if (hasErrors) return
    const id = generateId('PT')
    const dob = form.dob
    const born = new Date(dob)
    const age = new Date().getFullYear() - born.getFullYear()
    const payload = {
      id,
      name: form.fullName,
      initials: form.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      age,
      gender: form.gender,
      phone: form.phone,
      dob,
      bloodGroup: form.bloodGroup,
      allergies: form.allergies || 'None known',
      emergencyName: form.emergencyName,
      emergencyContact: form.emergencyContact,
      address: form.address,
    }

    const saved = insert('patients', payload)
    setPatient(saved)
    setSavedId(saved.id)
    navigate('/nurse/triage', { state: { patientId: saved.id } })
  }

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '56px', background: 'linear-gradient(135deg,#005454,#0b6e6e)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer', padding: 0 }} aria-label="Go back">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '700' }}>LabFlow</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '500' }}>Patient Registration</span>
      </nav>

      <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
        <div className="lf-card" style={{ width: '100%', maxWidth: '620px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 24px' }}>New Patient Registration</h2>

          {submitted && hasErrors && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff0f0', borderLeft: '4px solid #c62828', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px' }}>
              <svg width="18" height="18" fill="#c62828" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9z" clipRule="evenodd"/></svg>
              <span style={{ color: '#c62828', fontSize: '14px', fontWeight: '600' }}>Please fill in all required fields</span>
            </div>
          )}

          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Full Name *</label>
              <input className={`lf-input${errors.fullName ? ' error' : ''}`} value={form.fullName} onChange={set('fullName')} placeholder="First and last name" />
              {errors.fullName && <p style={{ fontSize: '12px', color: '#c62828', margin: '4px 0 0' }}>{errors.fullName}</p>}
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Phone Number</label>
              <input className="lf-input" type="tel" value={form.phone} onChange={set('phone')} placeholder="+237 651 234 567" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Date of Birth *</label>
              <input className={`lf-input${errors.dob ? ' error' : ''}`} type="date" value={form.dob} onChange={set('dob')} />
              {errors.dob && <p style={{ fontSize: '12px', color: '#c62828', margin: '4px 0 0' }}>{errors.dob}</p>}
            </div>
          </div>

          {/* Gender */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Gender</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['Female', 'Male', 'Other'].map(g => (
                <button key={g} onClick={() => setForm(p => ({ ...p, gender: g }))} style={{ flex: 1, padding: '11px 6px', borderRadius: '10px', border: `1.5px solid ${form.gender === g ? '#005454' : '#dde9e9'}`, background: form.gender === g ? '#e6f4f4' : '#fff', color: form.gender === g ? '#005454' : '#5a7272', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>{g}</button>
              ))}
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Blood Group</label>
              <select className="lf-input" value={form.bloodGroup} onChange={set('bloodGroup')} style={{ appearance: 'auto' }}>
                {['O+','O-','A+','A-','B+','B-','AB+','AB-'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Known Allergies</label>
              <input className="lf-input" value={form.allergies} onChange={set('allergies')} placeholder="e.g. Penicillin, None" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Emergency Name</label>
              <input className="lf-input" value={form.emergencyName} onChange={set('emergencyName')} placeholder="Name" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Emergency Contact</label>
              <input className="lf-input" value={form.emergencyContact} onChange={set('emergencyContact')} placeholder="Phone Number" />
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Home Address *</label>
            <textarea className={`lf-textarea${errors.address ? ' error' : ''}`} rows={3} value={form.address} onChange={set('address')} placeholder="Street address, City, State" />
            {errors.address && <p style={{ fontSize: '12px', color: '#c62828', margin: '4px 0 0' }}>{errors.address}</p>}
          </div>

          <div style={{ height: '1px', background: '#e8f2f2', marginBottom: '20px' }} />
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '15px' }} onClick={handleSubmit}>
            Register Patient
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
      {/* <Link to="/" className="back-to-index">← All screens</Link> */}
    </div>
  )
}

