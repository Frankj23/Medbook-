import { Link } from 'react-router-dom'

const GROUPS = [
  {
    role: 'Entry Point',
    emoji: '🔐',
    color: '#004545',
    screens: [
      { label: 'Login — Role Selection',   path: '/login',          desc: 'Doctor, Nurse, Lab Tech, Admin' },
    ],
  },
  {
    role: 'Receptionist / Nurse',
    emoji: '🏥',
    color: '#0b6e6e',
    screens: [
      { label: 'Patient Registration',     path: '/register',         desc: 'Full form — saves to db' },
      { label: 'ID Generated',             path: '/register/success', desc: 'MedBook+ record created' },
      { label: 'Print ID Card',            path: '/register/print',   desc: 'Working print button' },
      { label: 'Nurse Triage',             path: '/nurse/triage',     desc: 'Vitals + queue assignment' },
      { label: 'Sample Collection',        path: '/nurse/sample',     desc: 'Accession ID + dispatch to lab' },
    ],
  },
  {
    role: 'Doctor Portal',
    emoji: '🩺',
    color: '#005454',
    screens: [
      { label: 'Dashboard',                path: '/doctor/dashboard',              desc: 'Live patient queue + alerts' },
      { label: 'Active Consultation',      path: '/doctor/consultation',            desc: 'Saves to db + STAT toggle' },
      { label: 'Review & Confirm',         path: '/doctor/consultation/notes',      desc: 'Context-driven notes' },
      { label: 'Lab Request Sent',         path: '/doctor/consultation/confirmed',  desc: 'Confirmation state' },
      { label: 'Results Inbox',            path: '/doctor/results-inbox',           desc: 'Unreviewed lab results' },
      { label: 'Prescription Entry',       path: '/doctor/prescription/entry',      desc: 'Post-result prescription' },
      { label: 'Prescription Confirmed',   path: '/doctor/prescription/confirm',    desc: 'Sent to pharmacy' },
      { label: 'Prescription History',     path: '/doctor/prescription/history',    desc: '24-month archive' },
    ],
  },
  {
    role: 'Lab Technician — Mobile',
    emoji: '🔬',
    color: '#1a5c5c',
    screens: [
      { label: 'Lab Queue (mobile)',        path: '/lab/queue',   desc: 'Live orders from db' },
      { label: 'Results Entry (mobile)',    path: '/lab/results', desc: 'Saves results to db' },
    ],
  },
  {
    role: 'Lab Technician — Desktop',
    emoji: '🖥️',
    color: '#1a5c5c',
    screens: [
      { label: 'Lab Queue (desktop)',       path: '/lab/desktop/queue',   desc: 'STAT priority, full view' },
      { label: 'Results Entry (desktop)',   path: '/lab/desktop/results', desc: 'Full results form' },
    ],
  },
  {
    role: 'Admin',
    emoji: '📊',
    color: '#003535',
    screens: [
      { label: 'Admin Dashboard',           path: '/admin', desc: 'Live stats, patients, pipeline' },
    ],
  },
  {
    role: 'Pharmacy',
    emoji: '💊',
    color: '#7c2d12',
    screens: [
      { label: 'Pharmacy Screen',           path: '/pharmacy', desc: 'Review and dispense prescriptions' },
    ],
  },
]

export default function ScreenIndex() {
  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif', padding: '48px 24px' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,84,84,0.28)' }}>
              <span style={{ color: '#fff', fontSize: '24px', fontWeight: '800' }}>L</span>
            </div>
            <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#005454', margin: 0 }}>LabFlow</h1>
          </div>
          <p style={{ color: '#5a7272', fontSize: '16px', margin: '0 0 6px' }}>Clinical Portal · All Screens</p>
          <p style={{ color: '#8fa8a8', fontSize: '13px', margin: '0 0 20px' }}>21 screens · 6 roles · live backend data · Firebase integration</p>
          <Link to="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#005454,#0b6e6e)', color: '#fff', padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
            Start LabFlow →
          </Link>
        </div>

        {GROUPS.map(g => (
          <div key={g.role} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '3px', height: '22px', background: g.color, borderRadius: '2px' }} />
              <span style={{ fontSize: '11px', fontWeight: '700', color: g.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {g.emoji} {g.role}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '10px' }}>
              {g.screens.map(s => (
                <Link key={s.path} to={s.path} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1.5px solid transparent', boxShadow: '0 2px 12px rgba(0,84,84,0.06)', cursor: 'pointer', transition: 'all 0.18s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,84,84,0.12)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,84,84,0.06)' }}>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: g.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '6px' }}>{s.path}</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a2b2b', marginBottom: '4px' }}>{s.label}</div>
                    <div style={{ fontSize: '12px', color: '#5a7272', marginBottom: '12px' }}>{s.desc}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: g.color }}>Open screen →</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
