import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { query, update, insert, generateId, getPatients } from '../../services/db'
import { usePatient } from '../../context/PatientContext'

export default function ResultsEntryDesktop() {
  const navigate = useNavigate()
  const { patient: ctxPatient } = usePatient()
  const [patient, setPatientState] = useState(null)
  const [labRequest, setLabRequest] = useState(null)
  const [findings, setFindings] = useState('')
  const [parasiteDensity, setParasiteDensity] = useState('')
  const [hb, setHb] = useState('')
  const [wbc, setWbc] = useState('')
  const [plt, setPlt] = useState('')
  const [techNotes, setTechNotes] = useState('')
  const [reviewed, setReviewed] = useState(false)

  useEffect(() => {
    const p = ctxPatient || getPatients().find(pt => pt.status === 'sample_collected')
    if (p) {
      setPatientState(p)
      const reqs = query('lab_orders', r => r.patientId === p.id)
      setLabRequest(reqs[reqs.length - 1] || null)
    }
  }, [ctxPatient])

  const handleSubmit = () => {
    if (!reviewed || !labRequest) return

    const resultPayload = [
      { test: 'Malaria Test', value: findings || 'Negative', unit: '', ref: 'Negative', flag: findings === 'Positive' ? 'HIGH' : 'NORMAL' },
      ...(hb ? [{ test: 'Hemoglobin', value: hb, unit: 'g/dL', ref: '13.5–17.5', flag: parseFloat(hb) < 13.5 ? 'LOW' : 'NORMAL' }] : []),
      ...(wbc ? [{ test: 'White Blood Cells', value: wbc, unit: '10⁹/L', ref: '4.0–11.0', flag: parseFloat(wbc) < 4 ? 'LOW' : parseFloat(wbc) > 11 ? 'HIGH' : 'NORMAL' }] : []),
      ...(plt ? [{ test: 'Platelet Count', value: plt, unit: '10⁹/L', ref: '150–450', flag: parseFloat(plt) < 150 ? 'LOW' : parseFloat(plt) > 450 ? 'HIGH' : 'NORMAL' }] : []),
    ]

    update('lab_orders', labRequest.id, { status: 'resulted', results: resultPayload, submittedAt: new Date().toISOString() })
    update('consultations', labRequest.consultationId, { status: 'results_ready' })
    insert('lab_results', {
      id: generateId('RES'),
      labOrderId: labRequest.id,
      patientId: labRequest.patientId,
      results: resultPayload,
      techNotes,
      submittedBy: 'Alex Rivera',
      submittedAt: new Date().toISOString(),
      reviewedByDoctor: false,
    })
    update('patients', labRequest.patientId, { status: 'lab_resulted' })
    navigate('/lab/desktop/queue')
  }

  if (!patient) return (
    <div style={{ minHeight:'100vh', background:'#f6fafa', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="lf-card" style={{ padding:'40px', textAlign:'center' }}>
        <p style={{ color:'#8fa8a8', marginBottom:'14px' }}>No patient selected.</p>
        <button className="btn-primary" style={{ justifyContent:'center' }} onClick={() => navigate('/lab/desktop/queue')}>← Back to Queue</button>
      </div>
      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )

  const isStatOrder = labRequest?.priority === 'stat'

  return (
    <div style={{ minHeight:'100vh', background:'#f6fafa', fontFamily:'Inter, sans-serif' }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:'60px', background:'#fff', borderBottom:'1px solid #e8f2f2', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <button onClick={() => navigate('/lab/desktop/queue')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', color:'#005454', fontWeight:'600', fontSize:'13px', fontFamily:'Inter, sans-serif' }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Queue
          </button>
          <span style={{ color:'#e0ecec' }}>|</span>
          <span style={{ fontSize:'17px', fontWeight:'800', color:'#005454' }}>LabFlow</span>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {isStatOrder && <span style={{ background:'#c62828', color:'#fff', padding:'5px 14px', borderRadius:'999px', fontSize:'12px', fontWeight:'800' }}>STAT — URGENT</span>}
          <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'linear-gradient(135deg,#005454,#0b6e6e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#fff' }}>AR</div>
        </div>
      </nav>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', minHeight:'calc(100vh - 60px)' }}>
        <aside style={{ background:'#fff', borderRight:'1px solid #e8f2f2', padding:'24px 20px', position:'sticky', top:'60px', height:'calc(100vh - 60px)', overflowY:'auto' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'14px', background:'linear-gradient(135deg,#005454,#0b6e6e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'700', color:'#fff', marginBottom:'14px' }}>{patient.initials}</div>
          <h2 style={{ fontSize:'17px', fontWeight:'700', color:'#1a2b2b', margin:'0 0 4px' }}>Patient Profile</h2>
          <p style={{ fontSize:'12px', color:'#8fa8a8', margin:'0 0 18px' }}>Ref: {patient.id}</p>
          {[['Full Name', patient.name],['Age/DOB', patient.dob],['Gender', patient.gender],['Blood Group', patient.bloodGroup]].map(([k,v]) => (
            <div key={k} style={{ background:'#f0f7f7', borderRadius:'10px', padding:'10px 12px', marginBottom:'8px' }}>
              <p style={{ fontSize:'10px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 3px' }}>{k}</p>
              <p style={{ fontSize:'13px', fontWeight:'600', color:'#1a2b2b', margin:0 }}>{v}</p>
            </div>
          ))}
          {patient.allergies && patient.allergies !== 'None known' && (
            <div style={{ background:'#fff0f0', border:'1.5px solid #fca5a5', borderRadius:'10px', padding:'10px 12px', marginBottom:'8px' }}>
              <p style={{ fontSize:'10px', fontWeight:'700', color:'#c62828', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 3px' }}>⚠ ALLERGY</p>
              <p style={{ fontSize:'13px', color:'#c62828', margin:0 }}>{patient.allergies}</p>
            </div>
          )}
          {labRequest?.accessionNumber && (
            <div style={{ background:'#f0f7f7', borderRadius:'10px', padding:'10px 12px', marginTop:'8px' }}>
              <p style={{ fontSize:'10px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 3px' }}>Accession No.</p>
              <p style={{ fontSize:'13px', fontWeight:'700', color:'#005454', fontFamily:'monospace', margin:0 }}>{labRequest.accessionNumber}</p>
            </div>
          )}
          {isStatOrder && (
            <div style={{ background:'#fff0f0', border:'1.5px solid #fca5a5', borderRadius:'10px', padding:'10px 12px', marginTop:'8px' }}>
              <p style={{ fontSize:'11px', fontWeight:'700', color:'#c62828', margin:'0 0 3px' }}>STAT — Process immediately</p>
              <p style={{ fontSize:'12px', color:'#7a2020', margin:0 }}>Priority order — process before all routine samples.</p>
            </div>
          )}
        </aside>

        <main style={{ padding:'28px 32px', overflowY:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
            <div>
              <h1 style={{ fontSize:'24px', fontWeight:'800', color:'#005454', margin:'0 0 4px' }}>Enter Results</h1>
              <p style={{ fontSize:'13px', color:'#5a7272', margin:0 }}>Lab request for {patient.name} — {labRequest?.tests?.join(', ')}</p>
            </div>
          </div>

          {/* Malaria */}
          {labRequest?.tests?.some(t => t.toLowerCase().includes('malaria')) && (
            <div className="lf-card" style={{ padding:'24px', marginBottom:'18px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'linear-gradient(135deg,#005454,#0b6e6e)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4"/><path d="M9 3v18m0 0h6M9 21H5a2 2 0 0 1-2-2V9"/><circle cx="16" cy="16" r="6"/></svg>
                </div>
                <h3 style={{ fontSize:'17px', fontWeight:'700', color:'#005454', margin:0 }}>Malaria Parasite (MP)</h3>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                <div>
                  <label style={{ fontSize:'12px', fontWeight:'600', color:'#5a7272', display:'block', marginBottom:'8px' }}>Microscopic Finding / RDT Result</label>
                  <div style={{ display:'flex', gap:'8px' }}>
                    {['Positive','Negative'].map(opt => (
                      <button key={opt} onClick={() => setFindings(opt)} style={{
                        flex:1, padding:'12px', borderRadius:'10px', border:'none', cursor:'pointer', fontFamily:'Inter, sans-serif',
                        fontWeight:'700', fontSize:'14px',
                        background: findings === opt ? (opt === 'Positive' ? 'linear-gradient(135deg,#c62828,#e53935)' : 'linear-gradient(135deg,#1a7a4a,#2ea86a)') : '#f8fbfb',
                        color: findings === opt ? '#fff' : '#5a7272',
                      }}>{opt}</button>
                    ))}
                  </div>
                  {findings === 'Positive' && (
                    <div style={{ background:'#fff0f0', border:'1px solid #fca5a5', borderRadius:'8px', padding:'8px 12px', marginTop:'8px' }}>
                      <p style={{ fontSize:'12px', fontWeight:'600', color:'#c62828', margin:0 }}>⚠ Positive — doctor will be notified</p>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize:'12px', fontWeight:'600', color:'#5a7272', display:'block', marginBottom:'8px' }}>Parasite Density (per/mL)</label>
                  <div style={{ position:'relative' }}>
                    <input className="lf-input" type="number" placeholder="0.00" value={parasiteDensity} onChange={e => setParasiteDensity(e.target.value)} style={{ paddingRight:'60px' }} />
                    <span style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', fontSize:'11px', fontWeight:'700', color:'#8fa8a8' }}>PER/ML</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FBC */}
          {labRequest?.tests?.some(t => t.toLowerCase().includes('blood count') || t.toLowerCase().includes('fbc')) && (
            <div className="lf-card" style={{ padding:'24px', marginBottom:'18px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'#fea619', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                </div>
                <h3 style={{ fontSize:'17px', fontWeight:'700', color:'#1a2b2b', margin:0 }}>Full Blood Count (FBC)</h3>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'14px' }}>
                {[{ label:'Hemoglobin (Hb)', val:hb, set:setHb, unit:'G/DL', ref:'13.5–17.5' },{ label:'White Blood Cells', val:wbc, set:setWbc, unit:'10⁹/L', ref:'4.0–11.0' },{ label:'Platelet Count', val:plt, set:setPlt, unit:'10⁹/L', ref:'150–450' }].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize:'12px', fontWeight:'600', color:'#5a7272', display:'block', marginBottom:'6px' }}>{f.label}</label>
                    <div style={{ position:'relative' }}>
                      <input className="lf-input" type="number" placeholder="--" value={f.val} onChange={e => f.set(e.target.value)} style={{ paddingRight:'52px', background:'#f8fbfb' }} />
                      <span style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', fontSize:'10px', fontWeight:'700', color:'#8fa8a8' }}>{f.unit}</span>
                    </div>
                    <p style={{ fontSize:'11px', color:'#8fa8a8', margin:'3px 0 0' }}>Ref: {f.ref}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="lf-card" style={{ padding:'24px', marginBottom:'24px' }}>
            <h3 style={{ fontSize:'16px', fontWeight:'700', color:'#1a2b2b', margin:'0 0 14px' }}>Technician Observations</h3>
            <textarea className="lf-textarea" rows={4} placeholder="Any anomalies, interferences, or clinical notes..." value={techNotes} onChange={e => setTechNotes(e.target.value)} style={{ background:'#f8fbfb' }} />
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <label style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }}>
              <div onClick={() => setReviewed(!reviewed)} style={{ width:'22px', height:'22px', borderRadius:'6px', border:`2px solid ${reviewed ? '#005454' : '#dde9e9'}`, background:reviewed ? '#005454' : '#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {reviewed && <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span style={{ fontSize:'14px', fontWeight:'500', color:'#1a2b2b' }}>Mark as Reviewed &amp; Verified</span>
            </label>
            <div style={{ display:'flex', gap:'12px' }}>
              <button className="btn-ghost">Save Draft</button>
              <button className="btn-primary" style={{ opacity:reviewed ? 1 : 0.6 }} onClick={handleSubmit}>
                Submit Results to Doctor
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </main>
      </div>
      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

