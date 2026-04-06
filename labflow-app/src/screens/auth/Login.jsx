import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, ROLES } from '../../context/AuthContext'
import { resetDB } from '../../services/db'

const ROLE_META = [
  { key: 'receptionist', label: 'Receptionist',    icon: '📋', desc: 'Patient registration & triage', color: '#0b6e6e' },
  { key: 'doctor',       label: 'Doctor',           icon: '🩺', desc: 'Consultations & prescriptions', color: '#005454' },
  { key: 'lab_tech',     label: 'Lab Technician',   icon: '🔬', desc: 'Sample processing & results',   color: '#1a5c5c' },
  { key: 'admin',        label: 'Administrator',    icon: '📊', desc: 'Reports & system overview',     color: '#004545' },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [resetting, setResetting] = useState(false)

  const handleLogin = async (roleKey) => {
    try {
      const u = await login(roleKey)
      navigate(u.home)
    } catch (error) {
      console.error(error)
      navigate(ROLES[roleKey]?.home || '/')
    }
  }

  const handleReset = () => {
    setResetting(true)
    resetDB()
    setTimeout(() => setResetting(false), 800)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ height: '64px', background: 'linear-gradient(135deg,#005454,#0b6e6e)', display: 'flex', alignItems: 'center', padding: '0 32px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: '18px', fontWeight: '800' }}>L</span>
          </div>
          <span style={{ color: '#fff', fontSize: '20px', fontWeight: '700' }}>LabFlow</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>Port City General Hospital</span>
      </nav>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a2b2b', margin: '0 0 10px' }}>Welcome to LabFlow</h1>
          <p style={{ fontSize: '15px', color: '#5a7272', margin: 0 }}>Select your role to begin your session</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px', width: '100%', maxWidth: '600px', marginBottom: '32px' }}>
          {ROLE_META.map(role => (
            <button
              key={role.key}
              onClick={() => handleLogin(role.key)}
              style={{
                background: '#fff', border: '1.5px solid #e8f2f2',
                borderRadius: '16px', padding: '28px 24px', cursor: 'pointer',
                textAlign: 'left', fontFamily: 'Inter, sans-serif',
                transition: 'all 0.18s',
                boxShadow: '0 2px 12px rgba(0,84,84,0.06)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = role.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,84,84,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8f2f2'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,84,84,0.06)' }}
            >
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{role.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: role.color }} />
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a2b2b' }}>{role.label}</span>
              </div>
              <p style={{ fontSize: '13px', color: '#5a7272', margin: '0 0 16px' }}>{role.desc}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff' }}>
                  {ROLES[role.key].initials}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b' }}>{ROLES[role.key].name}</span>
              </div>
              <div style={{ marginTop: '16px', background: role.color, color: '#fff', borderRadius: '10px', padding: '10px', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}>
                Sign In →
              </div>
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={handleReset} style={{ background: 'none', border: '1.5px solid #e0ecec', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '12px', color: '#8fa8a8', fontFamily: 'Inter, sans-serif' }}>
            {resetting ? '✓ Reloaded' : '↺ Reload data'}
          </button>
          <Link to="/" style={{ fontSize: '12px', color: '#8fa8a8', textDecoration: 'none' }}>View all screens →</Link>
        </div>
      </div>
    </div>
  )
}

