import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePatient } from '../../context/PatientContext'
import { query, getById, update, formatTime } from '../../services/db'

export default function DoctorResultsInbox() {
  const { user } = useAuth()
  const { setPatientFromId } = usePatient()
  const navigate = useNavigate()
  const [results, setResults] = useState([])

  const loadResults = () => {
    const unreviewed = query('lab_results', r => !r.reviewedByDoctor)
    const enriched = unreviewed.map(r => ({
      ...r,
      patient: getById('patients', r.patientId),
      order:   getById('lab_orders', r.labOrderId),
    }))
    setResults(enriched)
  }

  useEffect(() => { loadResults() }, [])

  const handleReview = (result) => {
    update('lab_results', result.id, { reviewedByDoctor: true })
    setPatientFromId(result.patientId)
    navigate('/doctor/prescription/entry')
  }

  const flagColor = (flag) => flag === 'HIGH' || flag === 'LOW' ? '#c62828' : '#1a7a4a'
  const flagBg    = (flag) => flag === 'HIGH' || flag === 'LOW' ? '#fff0f0' : '#e8f7ef'

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '60px', background: '#fff', borderBottom: '1px solid #e8f2f2', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => navigate('/doctor/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#005454', display: 'flex', padding: '6px' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <span style={{ color: '#dde9e9' }}>|</span>
          <span style={{ fontSize: '17px', fontWeight: '700', color: '#1a2b2b' }}>LabFlow</span>
          <span style={{ color: '#dde9e9', margin: '0 4px' }}>|</span>
          <span style={{ fontSize: '14px', color: '#5a7272' }}>Results Inbox</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#5a7272' }}>{user ? user.name : 'Dr.'}</span>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>
            {user ? user.initials : 'SJ'}
          </div>
        </div>
      </nav>

      <div style={{ padding: '28px 32px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a2b2b', margin: '0 0 4px' }}>Results Inbox</h1>
            <p style={{ fontSize: '13px', color: '#5a7272', margin: 0 }}>Lab results awaiting your review and prescription.</p>
          </div>
          {results.length > 0 && (
            <div style={{ background: '#fff0f0', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#c62828', display: 'block' }} />
              <span style={{ fontSize: '14px', fontWeight: '700', color: '#c62828' }}>{results.length} result{results.length > 1 ? 's' : ''} pending review</span>
            </div>
          )}
        </div>

        {results.length === 0 ? (
          <div className="lf-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e8f7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1a7a4a" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 8px' }}>Inbox clear</h3>
            <p style={{ fontSize: '14px', color: '#5a7272', margin: 0 }}>No unreviewed results at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {results.map(res => (
              <div key={res.id} className="lf-card" style={{ padding: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: '24px', alignItems: 'start' }}>

                  {/* Patient info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                        {res.patient?.initials || '??'}
                      </div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 2px' }}>{res.patient?.name || res.patientId}</p>
                        <p style={{ fontSize: '12px', color: '#8fa8a8', margin: 0 }}>{res.patientId}</p>
                      </div>
                    </div>
                    <div style={{ background: '#f0f7f7', borderRadius: '8px', padding: '10px 12px' }}>
                      <p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em' }}>SUBMITTED</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b', margin: '0 0 4px' }}>{formatTime(res.submittedAt)}</p>
                      <p style={{ fontSize: '12px', color: '#5a7272', margin: 0 }}>by {res.submittedBy}</p>
                    </div>
                    {res.techNotes && (
                      <div style={{ background: '#fffbf0', borderRadius: '8px', padding: '10px 12px', marginTop: '8px', border: '1px solid #fde68a' }}>
                        <p style={{ fontSize: '10px', color: '#854F0B', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em' }}>TECH NOTES</p>
                        <p style={{ fontSize: '12px', color: '#633806', margin: 0, lineHeight: 1.5 }}>{res.techNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Results table */}
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>RESULTS SUMMARY</p>
                    <div style={{ display: 'grid', gap: '8px' }}>
                      {res.results.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: (r.flag === 'HIGH' || r.flag === 'LOW') ? '#fff0f0' : '#f8fbfb', borderRadius: '8px', padding: '10px 14px', border: `1px solid ${(r.flag === 'HIGH' || r.flag === 'LOW') ? '#fca5a5' : '#e8f2f2'}` }}>
                          <span style={{ fontSize: '13px', color: '#1a2b2b', fontWeight: '500' }}>{r.test}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: (r.flag === 'HIGH' || r.flag === 'LOW') ? '#c62828' : '#1a7a4a' }}>{r.value} {r.unit}</span>
                            <span style={{ fontSize: '11px', color: '#8fa8a8', fontStyle: 'italic' }}>({r.ref})</span>
                            {(r.flag === 'HIGH' || r.flag === 'LOW') && (
                              <span style={{ background: '#c62828', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px' }}>{r.flag}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
                    <button className="btn-amber" style={{ whiteSpace: 'nowrap' }} onClick={() => handleReview(res)}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Review &amp; Prescribe
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

