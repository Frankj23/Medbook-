import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getAll, query, resetDB } from '../../services/db'

function Stat({ label, value, sub, color }) {
  return (
    <div className="lf-card" style={{ padding: '20px' }}>
      <p style={{ fontSize: '12px', color: '#5a7272', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>{label}</p>
      <p style={{ fontSize: '36px', fontWeight: '800', color: color || '#1a2b2b', margin: '0 0 4px' }}>{value}</p>
      {sub && <p style={{ fontSize: '12px', color: '#8fa8a8', margin: 0 }}>{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState({ patients: [], consultations: [], orders: [], results: [] })
  const [resetMsg, setResetMsg] = useState(false)

  const load = () => {
    setData({
      patients:      getAll('patients'),
      consultations: getAll('consultations'),
      orders:        getAll('lab_orders'),
      results:       getAll('lab_results'),
      prescriptions: getAll('prescriptions'),
      triages:       getAll('triages'),
    })
  }

  useEffect(() => { load() }, [])

  const handleReset = () => {
    resetDB(); load()
    setResetMsg(true)
    setTimeout(() => setResetMsg(false), 2000)
  }

  const { patients, consultations, orders, results, prescriptions, triages } = data

  const pendingCollection = orders.filter(o => o.status === 'pending_collection').length
  const inLab             = orders.filter(o => o.status === 'collected').length
  const completedResults  = results.length
  const unreviewed        = results.filter(r => !r.reviewedByDoctor).length
  const statOrders        = orders.filter(o => o.stat).length

  const testCounts = {}
  orders.forEach(o => o.tests.forEach(t => { testCounts[t] = (testCounts[t] || 0) + 1 }))
  const topTests = Object.entries(testCounts).sort((a,b) => b[1]-a[1]).slice(0, 6)
  const maxCount = topTests[0]?.[1] || 1

  const statusBreakdown = [
    { label: 'Pending Collection', count: pendingCollection,    color: '#d97706' },
    { label: 'In Lab Queue',       count: inLab,                color: '#005454' },
    { label: 'Results Ready',      count: unreviewed,           color: '#c62828' },
    { label: 'Completed',          count: prescriptions.length, color: '#1a7a4a' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', height: '60px', background: '#fff', borderBottom: '1px solid #e8f2f2', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#005454,#0b6e6e)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '800' }}>L</span>
          </div>
          <span style={{ fontSize: '17px', fontWeight: '700', color: '#1a2b2b' }}>LabFlow</span>
          <span style={{ color: '#dde9e9', margin: '0 4px' }}>|</span>
          <span style={{ fontSize: '14px', color: '#5a7272' }}>Admin Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={handleReset} style={{ background: '#f0f7f7', border: '1px solid #e0ecec', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '12px', color: '#5a7272', fontFamily: 'Inter, sans-serif' }}>
            {resetMsg ? '✓ Data reloaded' : '↺ Reload data'}
          </button>
          <span style={{ fontSize: '13px', color: '#5a7272' }}>{user ? user.name : 'Admin'}</span>
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg,#004545,#005454)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff' }}>
            {user ? user.initials : 'JM'}
          </div>
          <button onClick={() => { logout(); navigate('/login') }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#8fa8a8', fontFamily: 'Inter, sans-serif' }}>Sign out</button>
        </div>
      </nav>

      <div style={{ padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a2b2b', margin: '0 0 4px' }}>Today's Overview</h1>
          <p style={{ fontSize: '13px', color: '#5a7272', margin: 0 }}>Port City General Hospital — real-time activity summary</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
          <Stat label="Patients Registered"  value={patients.length}      sub="today"               color="#005454" />
          <Stat label="Consultations"        value={consultations.length} sub="active today"        color="#1a5c5c" />
          <Stat label="Lab Orders"           value={orders.length}        sub={`${statOrders} STAT`} color="#854F0B" />
          <Stat label="Results Pending"      value={unreviewed}           sub="awaiting doctor"     color={unreviewed > 0 ? '#c62828' : '#1a7a4a'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

          {/* Workflow pipeline */}
          <div className="lf-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 20px' }}>Workflow Pipeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {statusBreakdown.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '130px', fontSize: '13px', color: '#5a7272', flexShrink: 0 }}>{s.label}</span>
                  <div style={{ flex: 1, height: '8px', background: '#f0f7f7', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max((s.count / (orders.length || 1)) * 100, s.count > 0 ? 8 : 0)}%`, height: '100%', background: s.color, borderRadius: '4px' }} />
                  </div>
                  <span style={{ width: '24px', fontSize: '14px', fontWeight: '700', color: '#1a2b2b', textAlign: 'right', flexShrink: 0 }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top tests ordered */}
          <div className="lf-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 20px' }}>Most Ordered Tests</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topTests.map(([test, count]) => (
                <div key={test} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ width: '170px', fontSize: '13px', color: '#5a7272', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{test}</span>
                  <div style={{ flex: 1, height: '8px', background: '#f0f7f7', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxCount) * 100}%`, height: '100%', background: '#005454', borderRadius: '4px' }} />
                  </div>
                  <span style={{ width: '20px', fontSize: '14px', fontWeight: '700', color: '#1a2b2b', textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent patients table */}
        <div className="lf-card" style={{ overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #f0f7f7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1a2b2b', margin: 0 }}>Registered Patients</h3>
            <span style={{ fontSize: '12px', color: '#8fa8a8' }}>{patients.length} total</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fbfb' }}>
                {['Patient', 'ID', 'Age / Gender', 'Blood Group', 'NHIS', 'Registered'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f0f7f7' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>{p.initials}</div>
                      <span style={{ fontWeight: '600', color: '#1a2b2b' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#005454', fontWeight: '600' }}>{p.id}</td>
                  <td style={{ padding: '12px 16px', color: '#5a7272' }}>{p.age} yrs · {p.gender}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: '#f0f7f7', color: '#005454', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700' }}>{p.bloodGroup}</span></td>
                  <td style={{ padding: '12px 16px', color: '#5a7272', fontSize: '12px' }}>{p.nhis}</td>
                  <td style={{ padding: '12px 16px', color: '#8fa8a8', fontSize: '12px' }}>{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick nav */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
          {[
            { label: 'Register Patient',    path: '/register',         icon: '📋', color: '#0b6e6e' },
            { label: 'Nurse Triage',        path: '/nurse/triage',     icon: '🏥', color: '#1a5c5c' },
            { label: 'Sample Collection',   path: '/nurse/sample',     icon: '🔬', color: '#005454' },
            { label: 'Doctor Dashboard',    path: '/doctor/dashboard', icon: '🩺', color: '#004545' },
          ].map(item => (
            <button key={item.label} onClick={() => navigate(item.path)} style={{ background: '#fff', border: '1.5px solid #e8f2f2', borderRadius: '12px', padding: '16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = '#f8fbfb' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8f2f2'; e.currentTarget.style.background = '#fff' }}>
              <span style={{ fontSize: '20px', display: 'block', marginBottom: '8px' }}>{item.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

