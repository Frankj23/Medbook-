import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getPatients, query, updatePatient } from '../../services/db'
import { usePatient } from '../../context/PatientContext'

export default function PatientDischarge() {
  const navigate = useNavigate()
  const { patient: ctxPatient } = usePatient()
  const [patient, setPatient] = useState(null)
  const [consultation, setConsultation] = useState(null)
  const [labRequest, setLabRequest] = useState(null)
  const [prescription, setPrescription] = useState(null)
  const [dischargeNotes, setDischargeNotes] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [discharged, setDischarged] = useState(false)

  useEffect(() => {
    const p = ctxPatient || getPatients().find(pt => pt.status === 'prescribed')
    if (p) {
      setPatient(p)
      const cons = query('consultations', c => c.patientId === p.id)
      setConsultation(cons[cons.length - 1] || null)
      const lab = query('lab_orders', r => r.patientId === p.id)
      setLabRequest(lab[lab.length - 1] || null)
      const rxs = query('prescriptions', r => r.patientId === p.id)
      setPrescription(rxs[rxs.length - 1] || null)
    }
  }, [ctxPatient])

  const handleDischarge = () => {
    if (!patient) return
    updatePatient(patient.id, { status:'discharged' })
    setDischarged(true)
  }

  if (discharged) {
    return (
      <div style={{ minHeight:'100vh', background:'#f6fafa', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="lf-card" style={{ padding:'52px 48px', textAlign:'center', maxWidth:'500px' }}>
          <div style={{ width:'64px', height:'64px', borderRadius:'50%', background:'linear-gradient(135deg,#1a7a4a,#2ea86a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 6px 20px rgba(26,122,74,0.28)' }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 style={{ fontSize:'24px', fontWeight:'800', color:'#1a2b2b', margin:'0 0 10px' }}>Patient Discharged</h2>
          <p style={{ fontSize:'14px', color:'#5a7272', margin:'0 0 8px' }}>{patient?.name} has been successfully discharged.</p>
          {followUpDate && <p style={{ fontSize:'14px', color:'#005454', fontWeight:'600', margin:'0 0 28px' }}>Follow-up: {new Date(followUpDate).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</p>}
          <div style={{ display:'flex', gap:'10px' }}>
            <button className="btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={() => window.print()}>Print Summary</button>
            <button className="btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={() => navigate('/doctor/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
        <Link to="/" className="back-to-index">← All screens</Link>
      </div>
    )
  }

  if (!patient) {
    return (
      <div style={{ minHeight:'100vh', background:'#f6fafa', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="lf-card" style={{ padding:'40px', textAlign:'center', maxWidth:'400px' }}>
          <p style={{ color:'#8fa8a8', marginBottom:'16px' }}>No patient ready for discharge. Prescribe medication first.</p>
          <button className="btn-primary" style={{ justifyContent:'center' }} onClick={() => navigate('/doctor/dashboard')}>← Back to Dashboard</button>
        </div>
        <Link to="/" className="back-to-index">← All screens</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f6fafa', fontFamily:'Inter, sans-serif' }}>
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:'60px', background:'#fff', borderBottom:'1px solid #e8f2f2' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <button onClick={() => navigate('/doctor/dashboard')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', color:'#005454', fontWeight:'600', fontSize:'14px' }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Dashboard
          </button>
          <span style={{ color:'#e0ecec' }}>|</span>
          <span style={{ fontSize:'17px', fontWeight:'700', color:'#1a2b2b' }}>Patient Discharge</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <span style={{ fontSize:'14px', color:'#5a7272' }}>Dr. Sarah Jenkins</span>
          <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#e0f2f2', border:'2px solid #b0d8d8', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:'700', color:'#005454' }}>SJ</div>
        </div>
      </nav>

      <div style={{ padding:'28px 32px', maxWidth:'960px', margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'24px' }}>
          <div>
            <h1 style={{ fontSize:'24px', fontWeight:'800', color:'#1a2b2b', margin:'0 0 4px' }}>Discharge Summary</h1>
            <p style={{ fontSize:'14px', color:'#5a7272', margin:0 }}>Review full case before discharging {patient.name}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,#1a2b2b,#2c4444)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', color:'#fff' }}>{patient.initials}</div>
            <div>
              <p style={{ fontSize:'16px', fontWeight:'700', color:'#1a2b2b', margin:0 }}>{patient.name}</p>
              <p style={{ fontSize:'12px', color:'#8fa8a8', margin:0 }}>{patient.id} · {patient.gender} · {patient.dob}</p>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
          {/* Consultation summary */}
          <div className="lf-card" style={{ padding:'20px' }}>
            <p style={{ fontSize:'11px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 12px' }}>CONSULTATION</p>
            {consultation ? (
              <>
                <p style={{ fontSize:'13px', color:'#5a7272', margin:'0 0 4px' }}>Presenting complaint</p>
                <p style={{ fontSize:'14px', color:'#1a2b2b', margin:'0 0 12px', lineHeight:1.5 }}>{consultation.symptoms}</p>
                <p style={{ fontSize:'13px', color:'#5a7272', margin:'0 0 4px' }}>Diagnosis</p>
                <p style={{ fontSize:'14px', fontWeight:'600', color:'#005454', margin:'0 0 12px' }}>{consultation.diagnosis}</p>
                <p style={{ fontSize:'13px', color:'#5a7272', margin:'0 0 6px' }}>Tests ordered</p>
                {consultation.selectedTests?.map(t => (
                  <span key={t} style={{ display:'inline-block', background:'#e6f4f4', color:'#005454', padding:'3px 10px', borderRadius:'999px', fontSize:'12px', fontWeight:'600', marginRight:'6px', marginBottom:'4px' }}>{t}</span>
                ))}
              </>
            ) : <p style={{ color:'#8fa8a8', fontSize:'13px' }}>No consultation on record</p>}
          </div>

          {/* Lab results summary */}
          <div className="lf-card" style={{ padding:'20px' }}>
            <p style={{ fontSize:'11px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 12px' }}>LAB RESULTS</p>
            {labRequest?.results ? (
              <div>
                {Object.entries(labRequest.results).filter(([k]) => k !== 'techNotes').map(([key, val]) => (
                  <div key={key} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid #e8f2f2' }}>
                    <span style={{ fontSize:'13px', color:'#5a7272', textTransform:'capitalize' }}>{key.replace(/([A-Z])/g,' $1').trim()}</span>
                    <span style={{ fontSize:'13px', fontWeight:'700', color: val === 'Positive' ? '#c62828' : '#1a2b2b' }}>{val}</span>
                  </div>
                ))}
                <p style={{ fontSize:'11px', color:'#8fa8a8', margin:'10px 0 4px', textTransform:'uppercase', letterSpacing:'0.06em' }}>Accession</p>
                <p style={{ fontSize:'13px', fontWeight:'700', color:'#005454', fontFamily:'monospace', margin:0 }}>{labRequest.accessionNumber}</p>
              </div>
            ) : <p style={{ color:'#8fa8a8', fontSize:'13px' }}>No lab results on record</p>}
          </div>

          {/* Prescription summary */}
          <div className="lf-card" style={{ padding:'20px' }}>
            <p style={{ fontSize:'11px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 12px' }}>PRESCRIPTION</p>
            {prescription ? (
              prescription.medications?.map((m, i) => (
                <div key={i} style={{ background:'#f0f7f7', borderRadius:'10px', padding:'12px 14px', marginBottom:'8px' }}>
                  <p style={{ fontSize:'14px', fontWeight:'700', color:'#1a2b2b', margin:'0 0 2px' }}>{m.name}</p>
                  <p style={{ fontSize:'12px', color:'#5a7272', margin:0 }}>{m.detail} · Qty: {m.qty}</p>
                </div>
              ))
            ) : <p style={{ color:'#8fa8a8', fontSize:'13px' }}>No prescription on record</p>}
          </div>

          {/* Discharge instructions */}
          <div className="lf-card" style={{ padding:'20px' }}>
            <p style={{ fontSize:'11px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 12px' }}>DISCHARGE INSTRUCTIONS</p>
            <textarea
              className="lf-textarea"
              rows={4}
              placeholder="Post-discharge care instructions, dietary advice, activity restrictions..."
              value={dischargeNotes}
              onChange={e => setDischargeNotes(e.target.value)}
              style={{ marginBottom:'12px' }}
            />
            <label style={{ fontSize:'12px', fontWeight:'600', color:'#5a7272', display:'block', marginBottom:'6px' }}>Follow-up Appointment</label>
            <input type="date" className="lf-input" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', borderRadius:'14px', padding:'16px 20px', border:'0.5px solid #e8f2f2' }}>
          <p style={{ fontSize:'13px', color:'#8fa8a8', margin:0 }}>Discharging physician: Dr. Sarah Jenkins · {new Date().toLocaleDateString('en-GB')}</p>
          <div style={{ display:'flex', gap:'12px' }}>
            <button className="btn-ghost" onClick={() => window.print()}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print Summary
            </button>
            <button className="btn-amber" style={{ padding:'13px 28px', fontSize:'15px' }} onClick={handleDischarge}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
              Confirm Discharge
            </button>
          </div>
        </div>
      </div>
      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

