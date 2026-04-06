import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ id: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const user = await login(form.id, form.password)
      navigate(user.home)
    } catch (err) {
      setError('Invalid ID or password')
    } finally {
      setLoading(false)
    }
  }

  const setField = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div style={{ minHeight: '100vh', background: '#f6fafa', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '56px', background: 'linear-gradient(135deg,#005454,#0b6e6e)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <span style={{ color: '#fff', fontSize: '17px', fontWeight: '700' }}>LabFlow</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: '500' }}>Clinical Portal</span>
      </nav>

      <div style={{ padding: '32px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)' }}>
        <div className="lf-card" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a2b2b', margin: '0 0 24px', textAlign: 'center' }}>Login to LabFlow</h2>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff0f0', borderLeft: '4px solid #c62828', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px' }}>
              <svg width="18" height="18" fill="#c62828" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9z" clipRule="evenodd"/>
              </svg>
              <span style={{ color: '#c62828', fontSize: '14px', fontWeight: '600' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>User ID</label>
              <input
                className="lf-input"
                type="text"
                value={form.id}
                onChange={setField('id')}
                placeholder="Enter your ID (e.g. DR-1024)"
                required
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#5a7272', display: 'block', marginBottom: '7px' }}>Password</label>
              <input
                className="lf-input"
                type="password"
                value={form.password}
                onChange={setField('password')}
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !form.id || !form.password}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: loading || !form.id || !form.password ? '#dde9e9' : 'linear-gradient(135deg,#005454,#0b6e6e)',
                color: loading || !form.id || !form.password ? '#5a7272' : '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading || !form.id || !form.password ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: '#5a7272', textAlign: 'center', margin: '16px 0 0' }}>
            Contact your administrator for login credentials
          </p>
        </div>
      </div>
    </div>
  )
}

//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px', width: '100%', maxWidth: '600px', marginBottom: '32px' }}>
//           {ROLE_META.map(role => (
//             <button
//               key={role.key}
//               onClick={() => handleLogin(role.key)}
//               style={{
//                 background: '#fff', border: '1.5px solid #e8f2f2',
//                 borderRadius: '16px', padding: '28px 24px', cursor: 'pointer',
//                 textAlign: 'left', fontFamily: 'Inter, sans-serif',
//                 transition: 'all 0.18s',
//                 boxShadow: '0 2px 12px rgba(0,84,84,0.06)',
//               }}
//               onMouseEnter={e => { e.currentTarget.style.borderColor = role.color; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,84,84,0.12)' }}
//               onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8f2f2'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,84,84,0.06)' }}
//             >
//               <div style={{ fontSize: '28px', marginBottom: '12px' }}>{role.icon}</div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
//                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: role.color }} />
//                 <span style={{ fontSize: '16px', fontWeight: '700', color: '#1a2b2b' }}>{role.label}</span>
//               </div>
//               <p style={{ fontSize: '13px', color: '#5a7272', margin: '0 0 16px' }}>{role.desc}</p>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                 <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: role.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff' }}>
//                   {ROLES[role.key].initials}
//                 </div>
//                 <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a2b2b' }}>{ROLES[role.key].name}</span>
//               </div>
//               <div style={{ marginTop: '16px', background: role.color, color: '#fff', borderRadius: '10px', padding: '10px', textAlign: 'center', fontSize: '13px', fontWeight: '700' }}>
//                 Sign In →
//               </div>
//             </button>
//           ))}
//         </div>

//         <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//           <button onClick={handleReset} style={{ background: 'none', border: '1.5px solid #e0ecec', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '12px', color: '#8fa8a8', fontFamily: 'Inter, sans-serif' }}>
//             {resetting ? '✓ Reloaded' : '↺ Reload data'}
//           </button>
//           <Link to="/" style={{ fontSize: '12px', color: '#8fa8a8', textDecoration: 'none' }}>View all screens →</Link>
//         </div>
//       </div>
//     </div>
//   )
// }

