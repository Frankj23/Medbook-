import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext'
import { query, update, insert, generateId } from '../../services/db'

export default function ResultsEntry() {
  const { patient } = usePatient()
  const [malariaResult, setMalariaResult] = useState(null)
  const [hemoglobin, setHemoglobin] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const navigate = useNavigate()

  const canSubmit = reviewed && malariaResult

  const handleSubmit = () => {
    if (!canSubmit) return
    const orders = query('lab_orders', o => o.patientId === patient.id && o.status === 'collected')
    const order = orders[0]
    if (order) {
      update('lab_orders', order.id, { status: 'completed' })
      update('consultations', order.consultationId, { status: 'results_ready' })
      insert('lab_results', {
        id: generateId('RES'),
        labOrderId: order.id,
        patientId: patient.id,
        results: [
          { test: 'Malaria Test', value: malariaResult, unit: '', ref: 'Negative', flag: malariaResult === 'Positive' ? 'HIGH' : 'NORMAL' },
          ...(hemoglobin ? [{ test: 'Hemoglobin', value: hemoglobin, unit: 'g/dL', ref: '13.5–17.5', flag: parseFloat(hemoglobin) < 13.5 ? 'LOW' : 'NORMAL' }] : []),
        ],
        techNotes: '',
        submittedBy: 'Alex Rivera',
        submittedAt: new Date().toISOString(),
        reviewedByDoctor: false,
      })
    }
    navigate('/lab/queue')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif', maxWidth: '420px', margin: '0 auto', paddingBottom: '32px' }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/lab/queue')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#005454', display: 'flex', padding: '6px' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>Enter Results</h1>
        </div>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff' }}>AR</div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <div className="lf-card" style={{ padding: '18px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>PATIENT PROFILE</p>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#005454', margin: '0 0 14px' }}>{patient.name}</h2>
            </div>
            <span className="badge-active">ACTIVE CASE</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {[['Age', `${patient.age} yrs`], ['Gender', patient.gender], ['ID', patient.id]].map(([k,v]) => (
              <div key={k} style={{ background: '#f0f7f7', borderRadius: '10px', padding: '10px 12px' }}>
                <p style={{ fontSize: '10px', color: '#5a7272', margin: '0 0 3px' }}>{k}</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>REQUIRED TESTS</p>

        {/* Malaria */}
        <div className="lf-card" style={{ padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M9 3v18m0 0h6M9 21H5a2 2 0 0 1-2-2V9"/><circle cx="16" cy="16" r="6"/><path d="M16 13v3l2 1"/></svg>
            </div>
            <div><h3 style={{ fontSize: '16px', fontWeight: '700', color: '#005454', margin: '0 0 2px' }}>Malaria Test</h3><p style={{ fontSize: '12px', color: '#5a7272', margin: 0 }}>Rapid Diagnostic Test (RDT)</p></div>
          </div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b', marginBottom: '10px' }}>Result Status</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <button onClick={() => setMalariaResult('Positive')} style={{ padding: '14px 12px', borderRadius: '12px', background: malariaResult === 'Positive' ? 'linear-gradient(135deg,#c62828,#e53935)' : '#f8fbfb', color: malariaResult === 'Positive' ? '#fff' : '#5a7272', fontWeight: '700', fontSize: '15px', cursor: 'pointer', border: malariaResult === 'Positive' ? 'none' : '1.5px solid #e0ecec', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif' }}>
              <span>⊕</span> Positive
            </button>
            <button onClick={() => setMalariaResult('Negative')} style={{ padding: '14px 12px', borderRadius: '12px', background: malariaResult === 'Negative' ? 'linear-gradient(135deg,#1a7a4a,#2ea86a)' : '#f8fbfb', color: malariaResult === 'Negative' ? '#fff' : '#5a7272', fontWeight: '700', fontSize: '15px', cursor: 'pointer', border: malariaResult === 'Negative' ? 'none' : '1.5px solid #e0ecec', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: 'Inter, sans-serif' }}>
              <span>⊖</span> Negative
            </button>
          </div>
          {malariaResult === 'Positive' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff0f0', borderRadius: '8px', padding: '10px 12px', border: '1px solid #fca5a5' }}>
              <svg width="14" height="14" fill="#c62828" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-8a1 1 0 0 0-1 1v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1z" clipRule="evenodd"/></svg>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#c62828' }}>Positive result — doctor will be notified immediately</span>
            </div>
          )}
        </div>

        {/* FBC */}
        <div className="lf-card" style={{ padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fea619', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
            </div>
            <div><h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 2px' }}>Full Blood Count</h3><p style={{ fontSize: '12px', color: '#5a7272', margin: 0 }}>Hemoglobin Concentration</p></div>
          </div>
          <div style={{ background: '#f0f7f7', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <input type="number" value={hemoglobin} onChange={e => setHemoglobin(e.target.value)} placeholder="0.00" style={{ background: 'none', border: 'none', outline: 'none', fontSize: '28px', fontWeight: '700', color: hemoglobin ? '#1a2b2b' : '#8fa8a8', width: '100%', fontFamily: 'Inter, sans-serif' }} />
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#5a7272', flexShrink: 0 }}>g/dL</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#5a7272' }}>Reference: 13.5 – 17.5 g/dL</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#c62828' }}>Urgent if &lt; 7.0</span>
          </div>
        </div>

        {/* Review checkbox */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', borderRadius: '12px', background: '#fff', border: `1.5px solid ${reviewed ? '#005454' : '#e0ecec'}`, cursor: 'pointer', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,84,84,0.06)' }}>
          <div onClick={() => setReviewed(!reviewed)} style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, border: `2px solid ${reviewed ? '#005454' : '#dde9e9'}`, background: reviewed ? '#005454' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
            {reviewed && <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
          </div>
          <div>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#1a2b2b', margin: '0 0 3px' }}>Mark as Reviewed</p>
            <p style={{ fontSize: '12px', color: '#5a7272', margin: 0 }}>I verify all entered data matches laboratory readings.</p>
          </div>
        </label>

        <button style={{ width: '100%', justifyContent: 'center', padding: '16px', background: canSubmit ? 'linear-gradient(135deg,#005454,#0b6e6e)' : '#e8f2f2', color: canSubmit ? '#fff' : '#5a7272', opacity: canSubmit ? 1 : 0.7, border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '15px', cursor: canSubmit ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Inter, sans-serif' }} onClick={handleSubmit}>
          Submit Results to Doctor
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

