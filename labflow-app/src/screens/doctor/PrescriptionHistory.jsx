import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const RECORDS = [
  { name: 'Elena Rodriguez', id: 'CS-99231-ER', date: 'Oct 24, 2023', medication: 'Lisinopril 10mg',  extra: '+1 more', status: 'Picked Up',  statusColor: '#1a7a4a', statusBg: '#e8f7ef' },
  { name: 'Marcus Thorne',   id: 'CS-11045-MT', date: 'Sep 12, 2023', medication: 'Amoxicillin 500mg', extra: null,      status: 'Expired',    statusColor: '#c62828', statusBg: '#fff0f0' },
  { name: 'Sarah Jenkins',   id: 'CS-88210-SJ', date: 'Aug 29, 2023', medication: 'Metformin 500mg',  extra: null,      status: 'Cancelled',  statusColor: '#855300', statusBg: '#fff3dc' },
  { name: 'David Kim',       id: 'CS-44021-DK', date: 'Aug 05, 2023', medication: 'Atorvastatin 20mg',extra: null,      status: 'Picked Up',  statusColor: '#1a7a4a', statusBg: '#e8f7ef' },
]

const SIDEBAR_ITEMS = [
  { label: 'Active Prescriptions', icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
  { label: 'History', active: true,  icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { label: 'Patient Records',       icon: <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
]

const INITIALS_BG = ['#005454','#0b6e6e','#1a5c5c','#004545']

export default function PrescriptionHistory() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('All Records')
  const [page, setPage] = useState(1)
  const TOTAL_PAGES = 32

  const filtered = RECORDS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.medication.toLowerCase().includes(search.toLowerCase()) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif', background: '#f6fafa' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px', flexShrink: 0, background: '#fff',
        borderRight: '1px solid #e8f2f2',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e8f2f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: 'linear-gradient(135deg,#005454,#0b6e6e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#005454', margin: 0 }}>Dr. Sanctuary</p>
              <p style={{ fontSize: '10px', color: '#8fa8a8', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Prescription Portal</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '10px 12px' }}>
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '10px 12px', borderRadius: '10px',
              background: item.active ? '#e6f4f4' : 'transparent',
              border: 'none', cursor: 'pointer',
              color: item.active ? '#005454' : '#5a7272',
              fontSize: '13px', fontWeight: item.active ? '600' : '500',
              marginBottom: '2px', fontFamily: 'Inter, sans-serif', textAlign: 'left',
            }}>
              <span style={{ color: item.active ? '#005454' : '#8fa8a8' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '12px', borderTop: '1px solid #e8f2f2' }}>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '11px', marginBottom: '8px' }}
            onClick={() => navigate('/doctor/prescription/entry')}>
            + New Prescription
          </button>
          {[
            { label: 'Help Center', icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></svg> },
            { label: 'Logout',      icon: <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg> },
          ].map(item => (
            <button key={item.label} style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              width: '100%', padding: '8px 12px', borderRadius: '8px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#5a7272', fontSize: '12px', fontFamily: 'Inter, sans-serif',
            }}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 28px', height: '60px', background: '#fff',
          borderBottom: '1px solid #e8f2f2', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <span style={{ fontSize: '17px', fontWeight: '800', color: '#005454' }}>Clinical Sanctuary</span>
          <div style={{ flex: 1, maxWidth: '320px', margin: '0 28px', position: 'relative' }}>
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8fa8a8' }}
              width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="lf-input"
              placeholder="Search records..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', background: '#f8fbfb' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{
              background: '#f0f7f7', border: 'none', borderRadius: '8px',
              width: '34px', height: '34px', cursor: 'pointer', color: '#5a7272',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <div style={{
              width: '34px', height: '34px', borderRadius: '50%',
              background: 'linear-gradient(135deg,#005454,#0b6e6e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: '700', color: '#fff',
            }}>AR</div>
          </div>
        </nav>

        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#8fa8a8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PORTAL</span>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#8fa8a8" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
            <span style={{ fontSize: '12px', color: '#005454', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HISTORY</span>
          </div>

          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a2b2b', margin: '0 0 5px' }}>Prescription History</h1>
              <p style={{ fontSize: '13px', color: '#5a7272', margin: 0 }}>
                Archived digital prescriptions and fulfillment status from the last 24 months.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '4px', background: '#f0f7f7', borderRadius: '12px', padding: '4px' }}>
              {['All Records', 'Archived'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 18px', borderRadius: '9px', border: 'none',
                  background: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? '#005454' : '#5a7272',
                  fontWeight: tab === t ? '700' : '500',
                  fontSize: '13px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,84,84,0.1)' : 'none',
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Search + filters row */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#8fa8a8' }}
                width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                className="lf-input"
                placeholder="Search by patient, medication or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: '#fff', border: '1.5px solid #dde9e9', borderRadius: '12px',
              padding: '12px 16px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500', color: '#5a7272',
              fontFamily: 'Inter, sans-serif',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Date Range
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: '#fff', border: '1.5px solid #dde9e9', borderRadius: '12px',
              padding: '12px 16px', cursor: 'pointer',
              fontSize: '13px', fontWeight: '500', color: '#5a7272',
              fontFamily: 'Inter, sans-serif',
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Status
            </button>
            <button style={{
              background: 'linear-gradient(135deg,#005454,#0b6e6e)', border: 'none',
              borderRadius: '12px', padding: '12px 14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                <line x1="4" y1="21" x2="4" y2="14"/>
                <line x1="4" y1="10" x2="4" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12" y2="3"/>
                <line x1="20" y1="21" x2="20" y2="16"/>
                <line x1="20" y1="12" x2="20" y2="3"/>
                <line x1="1" y1="14" x2="7" y2="14"/>
                <line x1="9" y1="8" x2="15" y2="8"/>
                <line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
            </button>
          </div>

          {/* Records list */}
          <div className="lf-card" style={{ overflow: 'hidden', marginBottom: '20px' }}>
            {filtered.map((rec, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2.5fr 1.5fr 2fr 1.5fr 1fr',
                alignItems: 'center', gap: '16px',
                padding: '18px 22px',
                borderBottom: i < filtered.length - 1 ? '1px solid #f0f7f7' : 'none',
              }}>
                {/* Patient */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                    background: INITIALS_BG[i % INITIALS_BG.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '700', color: '#fff',
                  }}>
                    {rec.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 2px' }}>{rec.name}</p>
                    <p style={{ fontSize: '12px', color: '#8fa8a8', margin: 0 }}>ID: {rec.id}</p>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>DATE ISSUED</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b', margin: 0 }}>{rec.date}</p>
                </div>

                {/* Medication */}
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>MEDICATION(S)</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b', margin: '0 0 2px' }}>{rec.medication}</p>
                  {rec.extra && (
                    <span style={{
                      background: '#f0f7f7', color: '#5a7272',
                      padding: '2px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600',
                    }}>{rec.extra}</span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#8fa8a8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>STATUS</p>
                  <span style={{
                    background: rec.statusBg, color: rec.statusColor,
                    padding: '5px 12px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: '700',
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: rec.statusColor }} />
                    {rec.status}
                  </span>
                </div>

                {/* Action */}
                <div>
                  <button className="btn-primary" style={{ fontSize: '12px', padding: '9px 16px' }}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '13px', color: '#5a7272', margin: 0 }}>
              Showing <strong>1–{Math.min(4, filtered.length)}</strong> of <strong>128</strong> prescriptions
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: '#fff', border: '1.5px solid #e0ecec',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5a7272',
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              {[1, 2, 3].map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: page === p ? 'linear-gradient(135deg,#005454,#0b6e6e)' : '#fff',
                  border: page !== p ? '1.5px solid #e0ecec' : 'none',
                  color: page === p ? '#fff' : '#5a7272',
                  fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}>{p}</button>
              ))}
              <span style={{ color: '#8fa8a8', fontSize: '14px' }}>…</span>
              <button onClick={() => setPage(TOTAL_PAGES)} style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: page === TOTAL_PAGES ? 'linear-gradient(135deg,#005454,#0b6e6e)' : '#fff',
                border: page !== TOTAL_PAGES ? '1.5px solid #e0ecec' : 'none',
                color: page === TOTAL_PAGES ? '#fff' : '#5a7272',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}>{TOTAL_PAGES}</button>
              <button style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: '#fff', border: '1.5px solid #e0ecec',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5a7272',
              }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

