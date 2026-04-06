import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { usePatient } from '../../context/PatientContext'
import { query, getById, formatTime } from '../../services/db'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { label: 'Queue', active: true, icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg> },
  { label: 'Archive', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="1 6 1 22 23 22 23 6"/><path d="M1 6l11 7 11-7M1 6h22"/></svg> },
  { label: 'Profile', icon: <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
]

export default function LabQueue() {
  const { user } = useAuth()
  const { setPatientFromId } = usePatient()
  const navigate = useNavigate()
  const [queue, setQueue] = useState([])
  const [completed, setCompleted] = useState(0)

  const load = () => {
    const orders = query('lab_orders', o => o.status === 'collected' || o.status === 'processing')
    const enriched = orders.map(o => ({ ...o, patient: getById('patients', o.patientId) }))
    const sorted = [...enriched].sort((a,b) => (b.stat ? 1 : 0) - (a.stat ? 1 : 0))
    setQueue(sorted)
    setCompleted(query('lab_orders', o => o.status === 'completed').length)
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif', maxWidth: '420px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#2c4444,#1a2b2b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: '#fff' }}>
              {user ? user.initials : 'AR'}
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>Lab Portal</p>
              <p style={{ fontSize: '12px', color: '#5a7272', margin: 0 }}>{user ? user.name : 'Alex Rivera'}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div className="lf-card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>PENDING TESTS</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: queue.length > 0 ? '#fea619' : '#1a7a4a', display: 'block' }} />
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#1a2b2b' }}>{queue.length}</span>
            </div>
          </div>
          <div className="lf-card" style={{ padding: '16px' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>COMPLETED TODAY</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a7a4a', display: 'block' }} />
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#1a2b2b' }}>{completed}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#005454', margin: 0 }}>Active Queue</h2>
          <span style={{ fontSize: '13px', color: '#5a7272', fontWeight: '500' }}>{queue.length} sample{queue.length !== 1 ? 's' : ''} waiting</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 20px', overflowY: 'auto', paddingBottom: '80px' }}>
        {queue.length === 0 ? (
          <div className="lf-card" style={{ padding: '32px', textAlign: 'center', marginTop: '8px' }}>
            <p style={{ color: '#8fa8a8', margin: 0 }}>Queue is empty. Waiting for sample collection.</p>
          </div>
        ) : queue.map((item, i) => (
          <div key={item.id} className="lf-card" style={{ padding: '16px', marginBottom: '12px', border: item.stat ? '1.5px solid #c62828' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '10px', fontWeight: '700', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>PATIENT</p>
                <p style={{ fontSize: '17px', fontWeight: '700', color: '#005454', margin: '0 0 2px' }}>{item.patient?.name || item.patientId}</p>
                <p style={{ fontSize: '12px', color: '#8fa8a8', margin: 0 }}>ID: {item.patientId} · {item.accessionId}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                {item.stat && <span style={{ background: '#c62828', color: '#fff', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '800' }}>STAT</span>}
                <span className="badge-pending">PENDING</span>
              </div>
            </div>
            <div style={{ background: '#f0f7f7', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#5a7272', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>REQUESTED TESTS</p>
              <p style={{ fontSize: '14px', color: '#1a2b2b', fontWeight: '500', margin: 0 }}>{item.tests.join(', ')}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#5a7272', margin: '0 0 2px' }}>{item.requestedBy}</p>
                <p style={{ fontSize: '12px', color: '#8fa8a8', margin: 0 }}>{formatTime(item.requestedAt)}</p>
              </div>
              <button className="btn-primary" style={{ fontSize: '13px', padding: '10px 16px' }} onClick={() => { setPatientFromId(item.patientId); navigate('/lab/results') }}>
                Open &amp; Enter
              </button>
            </div>
          </div>
        ))}
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '420px', background: '#fff', borderTop: '1px solid #e8f2f2', display: 'flex', padding: '10px 0 14px' }}>
        {NAV_ITEMS.map(item => (
          <button key={item.label} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: item.active ? '#005454' : '#8fa8a8', fontFamily: 'Inter, sans-serif' }}>
            {item.icon}
            <span style={{ fontSize: '11px', fontWeight: item.active ? '700' : '500' }}>{item.label}</span>
          </button>
        ))}
      </nav>
      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

