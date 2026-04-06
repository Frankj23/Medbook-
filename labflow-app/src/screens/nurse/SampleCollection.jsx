import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { query, getById, update, generateId, formatTime } from '../../services/db'

const STATUS_STYLES = {
  pending_collection: { label: 'Awaiting Collection', bg: '#fff3dc', color: '#854F0B', dot: '#d97706' },
  collected:          { label: 'Collected',            bg: '#e6f4f4', color: '#005454', dot: '#005454' },
}

export default function SampleCollection() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders]   = useState([])
  const [active, setActive]   = useState(null)
  const [confirm, setConfirm] = useState(false)

  const loadOrders = () => {
    const pending = query('lab_orders', o => o.status === 'pending_collection')
    const withPatient = pending.map(o => ({ ...o, patient: getById('patients', o.patientId) }))
    setOrders(withPatient)
  }

  useEffect(() => { loadOrders() }, [])

  const handleCollect = (order) => {
    const accessionId = 'ACC-' + order.patientId.replace('PT-', '') + '-' + generateId('').slice(-4)
    update('lab_orders', order.id, {
      status: 'collected',
      accessionId,
      collectedBy: user ? user.name : 'Nurse',
      collectedAt: new Date().toISOString(),
    })
    update('consultations', order.consultationId, { status: 'collected' })
    setActive(null)
    setConfirm(accessionId)
    loadOrders()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '60px', background: '#fff', borderBottom: '1px solid #e8f2f2', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#005454,#0b6e6e)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>L</span>
          </div>
          <span style={{ fontSize: '17px', fontWeight: '700', color: '#1a2b2b' }}>LabFlow</span>
          <span style={{ color: '#dde9e9', margin: '0 4px' }}>|</span>
          <span style={{ fontSize: '14px', color: '#5a7272' }}>Sample Collection</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#5a7272' }}>{user ? user.name : 'Nurse'}</span>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#0b6e6e,#005454)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>
            {user ? user.initials : 'NU'}
          </div>
        </div>
      </nav>

      <div style={{ padding: '28px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a2b2b', margin: '0 0 4px' }}>Sample Collection</h1>
            <p style={{ fontSize: '13px', color: '#5a7272', margin: 0 }}>Label samples, assign accession IDs, and dispatch to the lab.</p>
          </div>
          <div style={{ background: orders.length > 0 ? '#fff3dc' : '#e8f7ef', borderRadius: '12px', padding: '12px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '28px', fontWeight: '800', color: orders.length > 0 ? '#854F0B' : '#1a7a4a', margin: 0 }}>{orders.length}</p>
            <p style={{ fontSize: '11px', color: '#5a7272', margin: 0 }}>awaiting collection</p>
          </div>
        </div>

        {confirm && (
          <div style={{ background: '#e8f7ef', border: '1.5px solid #1a7a4a', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1a7a4a" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a7a4a', margin: 0 }}>Sample collected. Accession ID: <strong>{confirm}</strong> — now visible in lab queue.</p>
            <button onClick={() => setConfirm(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#1a7a4a', fontSize: '18px' }}>×</button>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="lf-card" style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e8f7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#1a7a4a" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 8px' }}>All samples collected</h3>
            <p style={{ fontSize: '14px', color: '#5a7272', margin: 0 }}>No pending collection orders at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {orders.map(order => (
              <div key={order.id} className="lf-card" style={{ padding: '20px', border: order.stat ? '1.5px solid #c62828' : undefined }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                  {/* Patient */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>
                      {order.patient?.initials || '??'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>{order.patient?.name || order.patientId}</p>
                        {order.stat && <span style={{ background: '#c62828', color: '#fff', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: '800' }}>STAT</span>}
                      </div>
                      <p style={{ fontSize: '12px', color: '#8fa8a8', margin: 0 }}>{order.patientId}</p>
                    </div>
                  </div>
                  {/* Tests */}
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>TESTS</p>
                    <p style={{ fontSize: '13px', color: '#1a2b2b', margin: 0 }}>{order.tests.join(', ')}</p>
                  </div>
                  {/* Requested by / time */}
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>ORDERED BY</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b', margin: '0 0 2px' }}>{order.requestedBy}</p>
                    <p style={{ fontSize: '12px', color: '#8fa8a8', margin: 0 }}>{formatTime(order.requestedAt)}</p>
                  </div>
                  {/* Action */}
                  <button
                    className="btn-primary"
                    style={{ fontSize: '13px', padding: '12px 20px', background: order.stat ? 'linear-gradient(135deg,#c62828,#e53935)' : undefined, borderColor: order.stat ? 'transparent' : undefined }}
                    onClick={() => setActive(order)}
                  >
                    Collect Sample
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collect modal */}
      {active && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }}>
          <div className="lf-card" style={{ width: '100%', maxWidth: '480px', padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 6px' }}>Confirm Sample Collection</h3>
            <p style={{ fontSize: '13px', color: '#5a7272', margin: '0 0 20px' }}>An accession ID will be auto-generated and the order will move to the lab queue.</p>

            <div style={{ background: '#f0f7f7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[['Patient', active.patient?.name || active.patientId], ['Tests', active.tests.join(', ')], ['Ordered by', active.requestedBy], ['Collector', user ? user.name : 'Nurse']].map(([k,v]) => (
                  <div key={k}>
                    <p style={{ fontSize: '10px', color: '#8fa8a8', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.06em' }}>{k}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b', margin: 0 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => setActive(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => handleCollect(active)}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7"/></svg>
                Confirm &amp; Label Sample
              </button>
            </div>
          </div>
        </div>
      )}

      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

