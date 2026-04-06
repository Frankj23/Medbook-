import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getPatients, query, insert, updatePatient } from '../../services/db'
import { usePatient } from '../../context/PatientContext'

export default function PrescriptionEntry() {
  const navigate = useNavigate()
  const { patient: ctxPatient } = usePatient()
  const [patient, setPatientState] = useState(null)
  const [labRequest, setLabRequest] = useState(null)
  const [consultation, setConsultationState] = useState(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [drugs, setDrugs] = useState([{ name:'', dosage:'', frequency:'', duration:'' }])

  useEffect(() => {
    const p = ctxPatient || getPatients().find(pt => pt.status === 'lab_resulted')
    if (p) {
      setPatientState(p)
      const lab = query('lab_orders', r => r.patientId === p.id)
      setLabRequest(lab[lab.length - 1] || null)
      const cons = query('consultations', c => c.patientId === p.id)
      const latestConsultation = cons[cons.length - 1] || null
      setConsultationState(latestConsultation)
      if (latestConsultation?.diagnosis) setDiagnosis(latestConsultation.diagnosis)
      if (lab[lab.length - 1]?.results?.malariaTest === 'Positive') {
        setDrugs([{ name:'Artemether-Lumefantrine', dosage:'80/480mg', frequency:'Twice daily', duration:'3 days' }])
      }
    }
  }, [ctxPatient])

  const setDrug = (i, k, v) => setDrugs(prev => prev.map((d, idx) => idx === i ? { ...d, [k]:v } : d))
  const addDrug = () => setDrugs(prev => [...prev, { name:'', dosage:'', frequency:'', duration:'' }])
  const removeDrug = (i) => setDrugs(prev => prev.filter((_,idx) => idx !== i))

  const handleSend = () => {
    if (!patient) return
    const rx = db.savePrescription({
      patientId: patient.id,
      consultationId: consultation?.id,
      labRequestId: labRequest?.id,
      diagnosis,
      medications: drugs.map((d, i) => ({ name: d.name, detail:`${d.dosage} · ${d.frequency}`, qty: parseInt(d.duration) || 7, ...d })),
    })
    db.updatePatient(patient.id, { status:'prescribed' })
    navigate('/doctor/prescription/confirm')
  }

  const labResults = labRequest?.results

  const LAB_ROWS = labResults ? [
    labResults.malariaTest   && { param:'Malaria Test',     result: labResults.malariaTest,   normal:'Negative',        status: labResults.malariaTest === 'Positive' ? 'danger' : 'ok' },
    labResults.hemoglobin    && { param:'Haemoglobin',      result:`${labResults.hemoglobin} g/dL`, normal:'13.5–17.5 g/dL', status: parseFloat(labResults.hemoglobin) < 13 ? 'danger' : 'ok' },
    labResults.platelets     && { param:'Platelet Count',   result:`${labResults.platelets} ×10⁹/L`, normal:'150–450 ×10⁹/L', status: parseFloat(labResults.platelets) < 150 ? 'warn' : 'ok' },
  ].filter(Boolean) : []

  if (!patient) return (
    <div style={{ minHeight:'100vh', background:'#f6fafa', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div className="lf-card" style={{ padding:'40px', textAlign:'center' }}>
        <p style={{ color:'#8fa8a8', marginBottom:'14px' }}>No patient with ready results. Check the lab queue.</p>
        <button className="btn-primary" style={{ justifyContent:'center' }} onClick={() => navigate('/doctor/dashboard')}>← Dashboard</button>
      </div>
      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Inter, sans-serif', background:'#f6fafa' }}>
      <aside style={{ width:'220px', flexShrink:0, background:'#fff', borderRight:'1px solid #e8f2f2', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh' }}>
        <div style={{ padding:'20px', borderBottom:'1px solid #e8f2f2' }}>
          <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,#005454,#0b6e6e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:'700', color:'#fff', marginBottom:'10px' }}>{patient.initials}</div>
          <p style={{ fontSize:'15px', fontWeight:'700', color:'#1a2b2b', margin:'0 0 2px' }}>{patient.name}</p>
          <p style={{ fontSize:'11px', color:'#8fa8a8', margin:0 }}>{patient.id}</p>
        </div>
        <div style={{ padding:'12px', flex:1 }}>
          {[['DOB', patient.dob],['Gender', patient.gender],['Blood Group', patient.bloodGroup],['Allergies', patient.allergies]].map(([k,v]) => (
            <div key={k} style={{ padding:'8px 0', borderBottom:'0.5px solid #e8f2f2' }}>
              <p style={{ fontSize:'11px', color:'#8fa8a8', margin:'0 0 2px' }}>{k}</p>
              <p style={{ fontSize:'13px', fontWeight:'600', color: k==='Allergies' && v !== 'None known' ? '#c62828' : '#1a2b2b', margin:0 }}>{v || '—'}</p>
            </div>
          ))}
        </div>
      </aside>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:'60px', background:'#fff', borderBottom:'1px solid #e8f2f2' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
            <button onClick={() => navigate('/doctor/dashboard')} style={{ background:'none', border:'none', cursor:'pointer', color:'#005454', fontWeight:'600', fontSize:'13px', fontFamily:'Inter, sans-serif', display:'flex', alignItems:'center', gap:'6px' }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Dashboard
            </button>
            <span style={{ color:'#e0ecec' }}>|</span>
            <span style={{ fontSize:'17px', fontWeight:'800', color:'#005454' }}>LabFlow</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <span style={{ fontSize:'14px', color:'#5a7272' }}>Dr. Sarah Jenkins</span>
            <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg,#005454,#0b6e6e)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:'#fff' }}>SJ</div>
          </div>
        </nav>

        <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px' }}>
            <h1 style={{ fontSize:'22px', fontWeight:'800', color:'#1a2b2b', margin:0 }}>Lab Results Ready</h1>
            <span style={{ width:'10px', height:'10px', borderRadius:'50%', background:'#1a7a4a', display:'block' }} />
            <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
              {labRequest?.priority === 'stat' && <span style={{ background:'#c62828', color:'#fff', padding:'5px 14px', borderRadius:'999px', fontSize:'12px', fontWeight:'700' }}>STAT</span>}
              <span style={{ background:'#f0f7f7', border:'1.5px solid #dde9e9', padding:'5px 14px', borderRadius:'999px', fontSize:'12px', fontWeight:'600', color:'#5a7272' }}>Verified by Lab Tech</span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr 1fr', gap:'16px' }}>
            {/* Col 1: Patient info */}
            <div className="lf-card" style={{ padding:'18px' }}>
              <p style={{ fontSize:'10px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 12px' }}>PATIENT INFORMATION</p>
              <p style={{ fontSize:'16px', fontWeight:'700', color:'#1a2b2b', margin:'0 0 10px' }}>{patient.name}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
                {[['Age/DOB', patient.dob],['Sex', patient.gender]].map(([k,v]) => (
                  <div key={k}><p style={{ fontSize:'11px', color:'#8fa8a8', margin:'0 0 2px' }}>{k}</p><p style={{ fontSize:'13px', fontWeight:'600', color:'#1a2b2b', margin:0 }}>{v}</p></div>
                ))}
              </div>
              <div style={{ background:'#f0f7f7', borderRadius:'8px', padding:'10px 12px', marginBottom:'10px' }}>
                <p style={{ fontSize:'11px', color:'#8fa8a8', margin:'0 0 3px' }}>Patient ID</p>
                <p style={{ fontSize:'13px', fontWeight:'700', color:'#005454', margin:0 }}>{patient.id}</p>
              </div>
              {consultation?.symptoms && (
                <div style={{ background:'#f8fbfb', borderRadius:'8px', padding:'10px 12px' }}>
                  <p style={{ fontSize:'10px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 4px' }}>NOTES</p>
                  <p style={{ fontSize:'12px', color:'#5a7272', margin:0, lineHeight:1.5 }}>{consultation.symptoms}</p>
                </div>
              )}
            </div>

            {/* Col 2: Results + diagnosis */}
            <div>
              <div className="lf-card" style={{ padding:'18px', marginBottom:'14px' }}>
                <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#1a2b2b', margin:'0 0 14px' }}>Laboratory Results</h3>
                {LAB_ROWS.length > 0 ? (
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr>{['Parameter','Result','Reference',''].map(h => <th key={h} style={{ fontSize:'10px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.05em', textAlign:'left', padding:'0 0 10px', whiteSpace:'nowrap' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {LAB_ROWS.map((row, i) => (
                        <tr key={i} style={{ borderTop:'1px solid #f0f7f7' }}>
                          <td style={{ padding:'10px 0', fontSize:'13px', color:'#1a2b2b', fontWeight:'500' }}>{row.param}</td>
                          <td style={{ padding:'10px 6px', fontSize:'13px', fontWeight:'700', color: row.status === 'danger' ? '#c62828' : row.status === 'warn' ? '#d97706' : '#1a7a4a' }}>{row.result}</td>
                          <td style={{ padding:'10px 6px', fontSize:'12px', color:'#8fa8a8', fontStyle:'italic' }}>{row.normal}</td>
                          <td style={{ padding:'10px 0' }}><span style={{ width:'8px', height:'8px', borderRadius:'50%', display:'inline-block', background: row.status === 'danger' ? '#c62828' : row.status === 'warn' ? '#d97706' : '#1a7a4a' }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p style={{ fontSize:'13px', color:'#8fa8a8' }}>No structured results available.</p>}
              </div>
              <div className="lf-card" style={{ padding:'18px' }}>
                <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#005454', margin:'0 0 10px' }}>Final Diagnosis</h3>
                <textarea className="lf-textarea" rows={4} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} style={{ background:'#f8fbfb' }} />
              </div>
            </div>

            {/* Col 3: Medications */}
            <div className="lf-card" style={{ padding:'18px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                <h3 style={{ fontSize:'15px', fontWeight:'700', color:'#1a2b2b', margin:0 }}>Medications</h3>
                <span style={{ fontSize:'18px' }}>💊</span>
              </div>
              {drugs.map((drug, i) => (
                <div key={i} style={{ background:'#f0f7f7', borderRadius:'12px', padding:'14px', marginBottom:'10px', position:'relative' }}>
                  {drugs.length > 1 && <button onClick={() => removeDrug(i)} style={{ position:'absolute', top:'10px', right:'10px', background:'none', border:'none', cursor:'pointer', color:'#8fa8a8', fontSize:'16px' }}>×</button>}
                  <p style={{ fontSize:'10px', fontWeight:'700', color:'#8fa8a8', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 8px' }}>DRUG {String(i+1).padStart(2,'0')}</p>
                  {[['Drug Name', 'name', 'e.g. Artemether-Lumefantrine'],['Dosage', 'dosage', 'e.g. 80/480mg'],['Frequency', 'frequency', 'e.g. Twice daily'],['Duration', 'duration', 'e.g. 3 days']].map(([label, key, ph]) => (
                    <div key={key} style={{ marginBottom:'8px' }}>
                      <p style={{ fontSize:'10px', color:'#8fa8a8', margin:'0 0 3px' }}>{label.toUpperCase()}</p>
                      <input className="lf-input" placeholder={ph} value={drug[key]} onChange={e => setDrug(i, key, e.target.value)} style={{ fontSize:'13px', padding:'8px 10px', background:'#fff' }} />
                    </div>
                  ))}
                </div>
              ))}
              <button onClick={addDrug} style={{ width:'100%', background:'none', border:'1.5px dashed #dde9e9', borderRadius:'10px', padding:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', color:'#005454', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter, sans-serif', marginBottom:'10px' }}>
                + Add Another Drug
              </button>
              <p style={{ fontSize:'11px', color:'#8fa8a8', margin:0 }}>Pharmacist will verify contraindications upon receipt.</p>
            </div>
          </div>
        </div>

        <div style={{ borderTop:'1px solid #e8f2f2', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', position:'sticky', bottom:0 }}>
          <div>
            <p style={{ fontSize:'13px', color:'#5a7272', margin:0 }}>Prescribing physician: Dr. Sarah Jenkins</p>
            <p style={{ fontSize:'11px', color:'#8fa8a8', margin:0 }}>{new Date().toLocaleDateString('en-GB')}</p>
          </div>
          <button className="btn-amber" style={{ padding:'14px 28px', fontSize:'15px' }} onClick={handleSend}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
            Send Prescription to Pharmacy
          </button>
        </div>
      </div>
      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

