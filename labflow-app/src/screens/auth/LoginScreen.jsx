import { useNavigate, Link } from 'react-router-dom'
import { usePatient } from '../../context/PatientContext'

const ROLES = [
  {
    id: 'receptionist',
    label: 'Reception',
    sublabel: 'Patient Registration',
    name: 'Amara Diallo',
    initials: 'AD',
    route: '/register',
    color: '#0b6e6e',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'nurse',
    label: 'Nurse Station',
    sublabel: 'Triage & Vitals',
    name: 'Nurse Comfort Mensah',
    initials: 'CM',
    route: '/triage',
    color: '#1a5c5c',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    id: 'doctor',
    label: 'Doctor Portal',
    sublabel: 'Consultation & Prescriptions',
    name: 'Dr. Sarah Jenkins',
    initials: 'SJ',
    route: '/doctor/dashboard',
    color: '#005454',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'lab_tech',
    label: 'Lab Portal',
    sublabel: 'Sample Processing & Results',
    name: 'Alex Rivera',
    initials: 'AR',
    route: '/lab/desktop/queue',
    color: '#004545',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="1.8">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
      </svg>
    ),
  },
]

export default function LoginScreen() {
  const navigate = useNavigate()
  const { login } = usePatient()

  const handleSelect = (role) => {
    login({ id: role.id, name: role.name, initials: role.initials, label: role.label })
    navigate(role.route)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f6fafa', fontFamily:'Inter, sans-serif', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:'64px', background:'#fff', borderBottom:'1px solid #e8f2f2' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'32px', height:'32px', background:'linear-gradient(135deg,#005454,#0b6e6e)', borderRadius:'9px', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'#fff', fontSize:'16px', fontWeight:'800' }}>L</span>
          </div>
          <span style={{ fontSize:'20px', fontWeight:'700', color:'#1a2b2b' }}>LabFlow</span>
        </div>
        <span style={{ fontSize:'13px', color:'#8fa8a8' }}>City General Hospital · {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</span>
      </nav>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px' }}>
        <h1 style={{ fontSize:'30px', fontWeight:'800', color:'#1a2b2b', margin:'0 0 8px', textAlign:'center' }}>
          Select your portal
        </h1>
        <p style={{ fontSize:'15px', color:'#5a7272', margin:'0 0 48px', textAlign:'center' }}>
          Choose your role to access your workspace
        </p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'20px', maxWidth:'700px', width:'100%' }}>
          {ROLES.map(role => (
            <button
              key={role.id}
              onClick={() => handleSelect(role)}
              style={{
                background:'#fff', border:'1.5px solid #e8f2f2', borderRadius:'18px',
                padding:'28px 24px', cursor:'pointer', textAlign:'left',
                fontFamily:'Inter, sans-serif',
                transition:'all 0.15s',
                boxShadow:'0 2px 12px rgba(0,84,84,0.06)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = role.color
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,84,84,0.14)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e8f2f2'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,84,84,0.06)'
              }}
            >
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:`linear-gradient(135deg,${role.color},${role.color}cc)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {role.icon}
                </div>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#c8d8d8" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <h2 style={{ fontSize:'18px', fontWeight:'700', color:'#1a2b2b', margin:'0 0 4px' }}>{role.label}</h2>
              <p style={{ fontSize:'13px', color:'#5a7272', margin:'0 0 16px' }}>{role.sublabel}</p>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:`${role.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'700', color:role.color }}>
                  {role.initials}
                </div>
                <span style={{ fontSize:'13px', color:'#8fa8a8' }}>{role.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid #e8f2f2', padding:'14px 32px', display:'flex', alignItems:'center', justifyContent:'center', gap:'24px', background:'#fff' }}>
        {['🛡️ HIPAA Compliant','🔒 Encrypted Sessions','© 2025 LabFlow Systems'].map(t => (
          <span key={t} style={{ fontSize:'12px', color:'#8fa8a8' }}>{t}</span>
        ))}
      </footer>

      <Link to="/" className="back-to-index">← All screens</Link>
    </div>
  )
}

